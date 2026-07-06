package com.srtgroup.todolist.service;

import com.srtgroup.todolist.dto.request.CreateTaskRequest;
import com.srtgroup.todolist.dto.request.UpdateTaskRequest;
import com.srtgroup.todolist.dto.response.TaskResponse;
import org.springframework.data.domain.Page;
import java.util.List;

public interface TaskService {
    TaskResponse createTask(CreateTaskRequest request);

    TaskResponse getTaskById(Long taskId);

    TaskResponse updateTask(Long taskId, UpdateTaskRequest request);

    TaskResponse changeTaskCategory(Long taskId, Long categoryId);

    void deleteTask(Long taskId);

    TaskResponse toggleTaskCompletion(Long taskId);

    Page<TaskResponse> getTasksByCategory(
            Long categoryId, String name, Boolean isCompleted,
            int page, int size, String sortBy, String sortDir);

    Page<TaskResponse> getUncategorizedTasks(
            String name, Boolean isCompleted,
            int page, int size, String sortBy, String sortDir);

    void moveTasks(List<Long> taskIds, Long categoryId);
}
