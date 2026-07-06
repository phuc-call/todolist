package com.srtgroup.todolist.service;

import com.srtgroup.todolist.dto.request.CreateCategoryRequest;
import com.srtgroup.todolist.dto.request.UpdateCategoryRequest;
import com.srtgroup.todolist.dto.response.CategoryResponse;
import org.springframework.data.domain.Page;

import com.srtgroup.todolist.dto.request.DeleteCategoryRequest;

public interface CategoryService {
    CategoryResponse createCategory(CreateCategoryRequest request);
    CategoryResponse updateCategory(Long id, UpdateCategoryRequest request);
    void deleteCategory(Long id, DeleteCategoryRequest request);
    Page<CategoryResponse> getCategories(String name, int page, int size, String sortBy, String sortDir);
}
