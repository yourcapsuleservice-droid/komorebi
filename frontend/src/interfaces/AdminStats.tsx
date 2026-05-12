interface AdminStats {
    totalUsers: number;
    totalReads: number;
    pendingReports: number;
    librarySize: number;
    weeklyActivity: number[];
    genreDistribution: number[];
}

export default AdminStats;