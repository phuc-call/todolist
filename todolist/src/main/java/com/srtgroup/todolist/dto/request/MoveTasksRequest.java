package com.srtgroup.todolist.dto.request;

import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.Setter;

import com.srtgroup.todolist.constants.MessageConstants;
import java.util.List;

@Getter
@Setter
public class MoveTasksRequest {
    @NotEmpty(message = MessageConstants.TASK_LIST_EMPTY_ERROR)
    private List<Long> taskIds;
    private Long categoryId;
}
