package com.srtgroup.todolist.dto.request;

import com.srtgroup.todolist.enums.TaskAction;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DeleteCategoryRequest {
    private TaskAction taskAction = TaskAction.DELETE;
    private Long newCategoryId;
}
