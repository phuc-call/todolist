package com.srtgroup.todolist.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorCode {
    NOT_FOLLOWED("You are not following this user", HttpStatus.BAD_REQUEST),
    CATEGORY_ALREADY_EXISTS("Category name already exists", HttpStatus.BAD_REQUEST),
    CATEGORY_NOT_FOUND("Category not found", HttpStatus.NOT_FOUND),
    TASK_NOT_FOUND("Task not found", HttpStatus.NOT_FOUND);

    private final String message;
    private final HttpStatus httpStatus;

    ErrorCode(String message, HttpStatus httpStatus) {
        this.message = message;
        this.httpStatus = httpStatus;
    }
}