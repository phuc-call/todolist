package com.srtgroup.todolist.service.impl;

import com.srtgroup.todolist.dto.request.CreateTaskRequest;
import com.srtgroup.todolist.dto.request.UpdateTaskRequest;
import com.srtgroup.todolist.dto.response.TaskResponse;
import com.srtgroup.todolist.entity.Category;
import com.srtgroup.todolist.entity.Task;
import com.srtgroup.todolist.exception.AppException;
import com.srtgroup.todolist.exception.ErrorCode;
import com.srtgroup.todolist.repository.CategoryRepository;
import com.srtgroup.todolist.repository.TaskRepository;
import com.srtgroup.todolist.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class TaskServiceImpl implements TaskService {

    private final TaskRepository taskRepository;
    private final CategoryRepository categoryRepository;

    @Override
    public TaskResponse createTask(CreateTaskRequest request) {
        Task task = new Task();
        task.setName(request.getName());
        task.setContent(request.getContent());
        task.setIsCompleted(false);

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));
            task.setCategory(category);
        }

        task = taskRepository.save(task);
        return toTaskResponse(task);
    }

    @Override
    @Transactional(readOnly = true)
    public TaskResponse getTaskById(Long taskId) {
        if (taskId == null) {
            throw new AppException(ErrorCode.TASK_NOT_FOUND);
        }
        return taskRepository.findTaskResponseById(taskId)
                .orElseThrow(() -> new AppException(ErrorCode.TASK_NOT_FOUND));
    }

    @Override
    public TaskResponse updateTask(Long taskId, UpdateTaskRequest request) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new AppException(ErrorCode.TASK_NOT_FOUND));

        if (request.getName() != null) {
            task.setName(request.getName());
        }
        if (request.getContent() != null) {
            task.setContent(request.getContent());
        }
        if (request.getIsCompleted() != null) {
            task.setIsCompleted(request.getIsCompleted());
        }
        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));
            task.setCategory(category);
        }

        task = taskRepository.save(task);
        return toTaskResponse(task);
    }

    @Override
    public TaskResponse changeTaskCategory(Long taskId, Long categoryId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new AppException(ErrorCode.TASK_NOT_FOUND));

        if (categoryId != null) {
            Category category = categoryRepository.findById(categoryId)
                    .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));
            task.setCategory(category);
        } else {
            task.setCategory(null);
        }

        task = taskRepository.save(task);
        return toTaskResponse(task);
    }

    @Override
    public void deleteTask(Long taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new AppException(ErrorCode.TASK_NOT_FOUND));
        taskRepository.delete(task);
    }

    @Override
    public TaskResponse toggleTaskCompletion(Long taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new AppException(ErrorCode.TASK_NOT_FOUND));
        task.setIsCompleted(!task.getIsCompleted());
        task = taskRepository.save(task);
        return toTaskResponse(task);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<TaskResponse> getTasksByCategory(
            Long categoryId, String name, Boolean isCompleted, 
            int page, int size, String sortBy, String sortDir) {
        
        if (!categoryRepository.existsById(categoryId)) {
            throw new AppException(ErrorCode.CATEGORY_NOT_FOUND);
        }

      Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name())
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        
        Pageable pageable = PageRequest.of(page, size, sort);
        
        return taskRepository.findTasksByCategory(categoryId, name, isCompleted, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<TaskResponse> getUncategorizedTasks(
            String name, Boolean isCompleted, 
            int page, int size, String sortBy, String sortDir) {
        
        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name())
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        
        Pageable pageable = PageRequest.of(page, size, sort);
        
        return taskRepository.findUncategorizedTasks(name, isCompleted, pageable);
    }

    @Override
    public void moveTasks(List<Long> taskIds, Long categoryId) {
        Category category = null;
        if (categoryId != null) {
            category = categoryRepository.findById(categoryId)
                    .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));
        }

        List<Task> tasks = taskRepository.findAllById(taskIds);
        for (Task task : tasks) {
            task.setCategory(category);
        }
        taskRepository.saveAll(tasks);
    }

    private TaskResponse toTaskResponse(Task task) {
        return TaskResponse.builder()
                .id(task.getId())
                .name(task.getName())
                .content(task.getContent())
                .isCompleted(task.getIsCompleted())
                .categoryId(task.getCategory() != null ? task.getCategory().getId() : null)
                .categoryName(task.getCategory() != null ? task.getCategory().getName() : null)
                .createdAt(task.getCreatedAt())
                .updatedAt(task.getUpdatedAt())
                .build();
    }
}
