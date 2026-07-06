package com.srtgroup.todolist.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateCategoryRequest {

    @NotNull(message = "Name cannot be null")
    @Size(min = 0, max = 30, message = "Name must be between 0 and 30 characters")
    private String name;

    @Size(min = 0, max = 255, message = "Description must be between 0 and 255 characters")
    private String description;
}
