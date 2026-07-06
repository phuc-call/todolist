package com.srtgroup.todolist.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateTaskRequest {

    @NotBlank(message = "Task name cannot be blank")
    @Size(max = 30, message = "Task name must be up to 30 characters")
    private String name;

    @Size(max = 1000, message = "Task content must be up to 1000 characters")
    private String content;

    private Long categoryId;
}
