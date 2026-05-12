import React, { useState, useMemo } from 'react';
import { Search, Calendar, ChevronRight } from 'lucide-react';

export function BlogSearch({ posts }: { posts: any[] }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPosts = useMemo(() => {
    if (!searchTerm) return posts;
    const term = searchTerm.toLowerCase();
    return posts.filter(post => 
      post.data.title.toLowerCase().includes(term) || 
      post.data.description.toLowerCase().includes(term)
    );
  }, [posts, searchTerm]);

  return (
    <div>
      {/* Search Bar */}
      <div className="relative max-w-2xl mx-auto mb-12 group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
        </div>
        <input
          type="text"
          className="block w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl text-base shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all dark:text-white"
          placeholder="Buscar artículos, recetas, guías..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Results */}
      {filteredPosts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">No encontramos artículos que coincidan con "{searchTerm}".</p>
          <button 
            onClick={() => setSearchTerm('')}
            className="mt-4 text-primary hover:underline font-medium"
          >
            Limpiar búsqueda
          </button>
        </div>
      ) : (
        <div className="grid gap-8">
          {filteredPosts.map((post) => (
            <article key={post.id} className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 md:p-8 hover:shadow-md transition-all hover:-translate-y-1">
              <div className="flex items-center gap-2 text-sm text-primary font-bold mb-4 tracking-wide uppercase">
                <Calendar className="w-4 h-4" />
                <time dateTime={post.data.date}>{post.data.date}</time>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
                <a href={`/blog/${post.id}`} className="hover:text-primary transition-colors">
                  {post.data.title}
                </a>
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                {post.data.description}
              </p>
              <a 
                href={`/blog/${post.id}`} 
                className="inline-flex items-center text-primary font-bold hover:gap-2 transition-all gap-1"
              >
                Leer artículo 
                <ChevronRight className="w-5 h-5" />
              </a>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
