package com.srtgroup.todolist.constants;

public final class AppConstants {
    private AppConstants() {
        // Prevent instantiation
    }

    public static final String DEFAULT_PAGE_NUMBER = "0";
    public static final String DEFAULT_PAGE_SIZE = "10";
    public static final String DEFAULT_SORT_BY = "createdAt";
    public static final String DEFAULT_SORT_DIR = "desc";

    public static final int PAGE_INDEX_MIN = 0;
    public static final int PAGE_SIZE_MIN = 1;
    public static final int PAGE_SIZE_MAX = 20;
}
