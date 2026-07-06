package com.srtgroup.todolist.controller;

import com.srtgroup.todolist.constants.AppConstants;
import com.srtgroup.todolist.constants.MessageConstants;
import com.srtgroup.todolist.dto.request.ChangeTaskCategoryRequest;
import com.srtgroup.todolist.dto.request.CreateTaskRequest;
import com.srtgroup.todolist.dto.request.UpdateTaskRequest;
import com.srtgroup.todolist.dto.request.MoveTasksRequest;
import com.srtgroup.todolist.dto.response.ApiResponse;
import com.srtgroup.todolist.dto.response.TaskResponse;
import com.srtgroup.todolist.service.TaskService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import static com.srtgroup.todolist.constants.AppConstants.*;

@RestController
@RequestMapping("/api/v1/tasks")
@RequiredArgsConstructor
@org.springframework.validation.annotation.Validated
public class TaskController {

    private final TaskService taskService;

    @PostMapping
    public ResponseEntity<ApiResponse<TaskResponse>> createTask(@Valid @RequestBody CreateTaskRequest request) {
        TaskResponse response = taskService.createTask(request);
        return new ResponseEntity<>(ApiResponse.ok(response, MessageConstants.TASK_CREATED_SUCCESSFULLY), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TaskResponse>> getTaskById(@PathVariable Long id) {
        TaskResponse response = taskService.getTaskById(id);
        return ResponseEntity.ok(ApiResponse.ok(response, MessageConstants.TASK_DETAILS_RETRIEVED_SUCCESSFULLY));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TaskResponse>> updateTask(
            @PathVariable Long id,
            @Valid @RequestBody UpdateTaskRequest request) {
        TaskResponse response = taskService.updateTask(id, request);
        return ResponseEntity.ok(ApiResponse.ok(response, MessageConstants.TASK_UPDATED_SUCCESSFULLY));
    }

    @PatchMapping("/{id}/category")
    public ResponseEntity<ApiResponse<TaskResponse>> changeTaskCategory(
            @PathVariable Long id, 
            @RequestBody ChangeTaskCategoryRequest request) {
        TaskResponse response = taskService.changeTaskCategory(id, request.getCategoryId());
        return ResponseEntity.ok(ApiResponse.ok(response, MessageConstants.TASK_CATEGORY_CHANGED_SUCCESSFULLY));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
        return ResponseEntity.ok(ApiResponse.ok(null, MessageConstants.TASK_DELETED_SUCCESSFULLY));
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<ApiResponse<TaskResponse>> toggleTaskCompletion(@PathVariable Long id) {
        TaskResponse response = taskService.toggleTaskCompletion(id);
        return ResponseEntity.ok(ApiResponse.ok(response, MessageConstants.TASK_STATUS_TOGGLED_SUCCESSFULLY));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<TaskResponse>>> getTasksByCategory(
            @RequestParam Long categoryId,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Boolean isCompleted,
            @RequestParam(defaultValue = DEFAULT_PAGE_NUMBER)
            @Min(value = PAGE_INDEX_MIN, message = MessageConstants.PAGE_INDEX_MIN_ERROR) int page,
            @RequestParam(defaultValue = DEFAULT_PAGE_SIZE)
            @Min(value =PAGE_SIZE_MIN, message = MessageConstants.PAGE_SIZE_MIN_ERROR)
            @Max(value = PAGE_SIZE_MAX, message = MessageConstants.PAGE_SIZE_MAX_ERROR) int size,
            @RequestParam(defaultValue = DEFAULT_SORT_BY) String sortBy,
            @RequestParam(defaultValue = DEFAULT_SORT_DIR) String sortDir) {
        Page<TaskResponse> tasks = taskService.getTasksByCategory(categoryId, name, isCompleted, page, size, sortBy, sortDir);
        return ResponseEntity.ok(ApiResponse.ok(tasks, MessageConstants.TASKS_RETRIEVED_SUCCESSFULLY));
    }

    @GetMapping("/uncategorized")
    public ResponseEntity<ApiResponse<Page<TaskResponse>>> getUncategorizedTasks(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Boolean isCompleted,
            @RequestParam(defaultValue = DEFAULT_PAGE_NUMBER)
            @Min(value = PAGE_INDEX_MIN, message = MessageConstants.PAGE_INDEX_MIN_ERROR) int page,
            @RequestParam(defaultValue = DEFAULT_PAGE_SIZE)
            @Min(value =PAGE_SIZE_MIN, message = MessageConstants.PAGE_SIZE_MIN_ERROR)
            @Max(value = PAGE_SIZE_MAX, message = MessageConstants.PAGE_SIZE_MAX_ERROR) int size,
            @RequestParam(defaultValue = DEFAULT_SORT_BY) String sortBy,
            @RequestParam(defaultValue = DEFAULT_SORT_DIR) String sortDir) {
        Page<TaskResponse> tasks = taskService.getUncategorizedTasks(name, isCompleted, page, size, sortBy, sortDir);
        return ResponseEntity.ok(ApiResponse.ok(tasks, MessageConstants.TASKS_RETRIEVED_SUCCESSFULLY));
    }

    @PatchMapping("/move")
    public ResponseEntity<ApiResponse<Void>> moveTasks(
            @Valid @RequestBody MoveTasksRequest request) {
        taskService.moveTasks(request.getTaskIds(), request.getCategoryId());
        return ResponseEntity.ok(ApiResponse.ok(null, MessageConstants.TASK_CATEGORY_CHANGED_SUCCESSFULLY));
    }
}
