import { motion } from 'framer-motion';

export const SkeletonLoader = ({ type = 'card', count = 1 }) => {
  const variants = {
    card: (
      <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-gray-800 to-gray-700 animate-pulse" />
          <div className="w-6 h-6 rounded-full bg-gray-800 animate-pulse" />
        </div>
        <div className="h-4 bg-gray-800 rounded w-24 animate-pulse mb-2" />
        <div className="h-8 bg-gray-800 rounded w-32 animate-pulse" />
      </div>
    ),
    activity: (
      <div className="flex justify-between items-center p-4 bg-gray-800/20 rounded-xl border border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-gray-700 animate-pulse" />
          <div className="h-4 bg-gray-800 rounded w-48 animate-pulse" />
        </div>
        <div className="h-3 bg-gray-800 rounded w-16 animate-pulse" />
      </div>
    ),
    metric: (
      <div className="space-y-2">
        <div className="h-3 bg-gray-800 rounded w-20 animate-pulse" />
        <div className="h-8 bg-gray-800 rounded w-16 animate-pulse" />
      </div>
    ),
    line: (
      <div className="h-4 bg-gray-800 rounded w-full animate-pulse" />
    )
  };

  const Component = variants[type] || variants.card;
  
  if (count > 1) {
    return (
      <div className="space-y-4">
        {Array(count).fill().map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            {Component}
          </motion.div>
        ))}
      </div>
    );
  }
  
  return Component;
};

// Skeleton pour le dashboard complet
export const DashboardSkeleton = () => {
  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map(i => (
            <SkeletonLoader key={i} type="card" />
          ))}
        </div>
        
        {/* Activity skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-900/50 rounded-2xl p-6">
            <div className="h-6 bg-gray-800 rounded w-32 animate-pulse mb-4" />
            <div className="space-y-3">
              {[1, 2, 3, 4].map(i => (
                <SkeletonLoader key={i} type="activity" />
              ))}
            </div>
          </div>
          <div className="bg-gray-900/50 rounded-2xl p-6">
            <div className="h-6 bg-gray-800 rounded w-32 animate-pulse mb-4" />
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <SkeletonLoader key={i} type="metric" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};