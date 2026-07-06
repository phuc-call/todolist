package com.srtgroup.todolist.controller;

import com.srtgroup.todolist.constants.AppConstants;
import com.srtgroup.todolist.constants.MessageConstants;
import com.srtgroup.todolist.dto.request.CreateCategoryRequest;
import com.srtgroup.todolist.dto.request.UpdateCategoryRequest;
import com.srtgroup.todolist.dto.response.ApiResponse;
import com.srtgroup.todolist.dto.response.CategoryResponse;
import com.srtgroup.todolist.service.CategoryService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/categories")
@RequiredArgsConstructor
@Validated
public class CategoryController {

    private final CategoryService categoryService;

    @PostMapping
    public ResponseEntity<ApiResponse<CategoryResponse>> createCategory(
            @Valid @RequestBody CreateCategoryRequest request) {
        CategoryResponse response = categoryService.createCategory(request);
        return new ResponseEntity<>(ApiResponse.ok(response, MessageConstants.CATEGORY_CREATED_SUCCESSFULLY),
                HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoryResponse>> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody UpdateCategoryRequest request) {
        CategoryResponse response = categoryService.updateCategory(id, request);
        return ResponseEntity.ok(ApiResponse.ok(response, MessageConstants.CATEGORY_UPDATED_SUCCESSFULLY));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(
            @PathVariable Long id,
            @RequestBody(required = false) com.srtgroup.todolist.dto.request.DeleteCategoryRequest request) {
        categoryService.deleteCategory(id, request);
        return ResponseEntity.ok(ApiResponse.ok(null, MessageConstants.CATEGORY_DELETED_SUCCESSFULLY));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<CategoryResponse>>> getCategories(
            @RequestParam(required = false) String name,
            @RequestParam(defaultValue = AppConstants.DEFAULT_PAGE_NUMBER) @Min(value = AppConstants.PAGE_INDEX_MIN, message = MessageConstants.PAGE_INDEX_MIN_ERROR) int page,
            @RequestParam(defaultValue = AppConstants.DEFAULT_PAGE_SIZE) @Min(value = AppConstants.PAGE_SIZE_MIN, message = MessageConstants.PAGE_SIZE_MIN_ERROR) @Max(value = AppConstants.PAGE_SIZE_MAX, message = MessageConstants.PAGE_SIZE_MAX_ERROR) int size,
            @RequestParam(defaultValue = AppConstants.DEFAULT_SORT_BY) String sortBy,
            @RequestParam(defaultValue = AppConstants.DEFAULT_SORT_DIR) String sortDir) {
        Page<CategoryResponse> categories = categoryService.getCategories(name, page, size, sortBy, sortDir);
        return ResponseEntity.ok(ApiResponse.ok(categories, MessageConstants.CATEGORIES_RETRIEVED_SUCCESSFULLY));
    }
}
