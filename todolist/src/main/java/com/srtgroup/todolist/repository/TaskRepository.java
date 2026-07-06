package com.srtgroup.todolist.repository;

import com.srtgroup.todolist.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.srtgroup.todolist.dto.response.TaskResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    @Query("SELECT new com.srtgroup.todolist.dto.response.TaskResponse(" +
           "t.id, t.name, t.isCompleted, c.id, t.createdAt, t.updatedAt) " +
           "FROM Task t LEFT JOIN t.category c " +
           "WHERE t.category.id = :categoryId " +
           "AND (:name IS NULL OR LOWER(t.name) LIKE LOWER(CONCAT('%', :name, '%'))) " +
           "AND (:isCompleted IS NULL OR t.isCompleted = :isCompleted)")
    Page<TaskResponse> findTasksByCategory(
            @Param("categoryId") Long categoryId, 
            @Param("name") String name, 
            @Param("isCompleted") Boolean isCompleted, 
            Pageable pageable);

    @Query("SELECT new com.srtgroup.todolist.dto.response.TaskResponse(" +
           "t.id, t.name, t.isCompleted, CAST(null AS long), t.createdAt, t.updatedAt) " +
           "FROM Task t " +
           "WHERE t.category IS NULL " +
           "AND (:name IS NULL OR LOWER(t.name) LIKE LOWER(CONCAT('%', :name, '%'))) " +
           "AND (:isCompleted IS NULL OR t.isCompleted = :isCompleted)")
    Page<TaskResponse> findUncategorizedTasks(
            @Param("name") String name, 
            @Param("isCompleted") Boolean isCompleted, 
            Pageable pageable);

    @Query("SELECT new com.srtgroup.todolist.dto.response.TaskResponse(" +
           "t.id, t.name, t.content, t.isCompleted, c.id, c.name, t.createdAt, t.updatedAt) " +
           "FROM Task t LEFT JOIN t.category c " +
           "WHERE t.id = :taskId")
    Optional<TaskResponse> findTaskResponseById(@Param("taskId") Long taskId);
}
