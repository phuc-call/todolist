package com.srtgroup.todolist.service.impl;

import com.srtgroup.todolist.dto.request.CreateCategoryRequest;
import com.srtgroup.todolist.dto.request.UpdateCategoryRequest;
import com.srtgroup.todolist.dto.request.DeleteCategoryRequest;
import com.srtgroup.todolist.enums.TaskAction;
import com.srtgroup.todolist.dto.response.CategoryResponse;
import com.srtgroup.todolist.entity.Category;
import com.srtgroup.todolist.exception.AppException;
import com.srtgroup.todolist.exception.ErrorCode;
import com.srtgroup.todolist.repository.CategoryRepository;
import com.srtgroup.todolist.repository.TaskRepository;
import com.srtgroup.todolist.service.CategoryService;
import com.srtgroup.todolist.entity.Task;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final TaskRepository taskRepository;

    @Override
    public CategoryResponse createCategory(CreateCategoryRequest request) {
        if (categoryRepository.existsByName(request.getName())) {
            throw new AppException(ErrorCode.CATEGORY_ALREADY_EXISTS);
        }

        Category category = new Category();
        category.setName(request.getName());
        category.setDescription(request.getDescription());
        
        category = categoryRepository.save(category);
        
        return toCategoryResponse(category);
    }

    @Override
    public CategoryResponse updateCategory(Long id, UpdateCategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));

        if (categoryRepository.existsByNameAndIdNot(request.getName(), id)) {
            throw new AppException(ErrorCode.CATEGORY_ALREADY_EXISTS);
        }

        category.setName(request.getName());
        category.setDescription(request.getDescription());

        category = categoryRepository.save(category);

        return toCategoryResponse(category);
    }

    @Override
    public void deleteCategory(Long id, DeleteCategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));
        
        TaskAction taskAction = request != null && request.getTaskAction() != null 
                ? request.getTaskAction() 
                : TaskAction.DELETE;

        if (taskAction == TaskAction.MOVE || taskAction == TaskAction.SET_NULL) {
            Category newCategory = null;
            if (taskAction == TaskAction.MOVE && request.getNewCategoryId() != null) {
                newCategory = categoryRepository.findById(request.getNewCategoryId())
                        .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));
            }
            List<Task> tasks = new ArrayList<>(category.getTasks());
            for (Task task : tasks) {
                task.setCategory(newCategory);
            }
            category.getTasks().clear();
            taskRepository.saveAll(tasks);
        }
        
        categoryRepository.delete(category);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<CategoryResponse> getCategories(String name, int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name()) ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return categoryRepository.findAllCategories(name, pageable);
    }

    private CategoryResponse toCategoryResponse(Category category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .createdAt(category.getCreatedAt())
                .updatedAt(category.getUpdatedAt())
                .build();
    }
}
