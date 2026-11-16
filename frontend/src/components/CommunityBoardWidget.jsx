import React, { useState, useEffect } from 'react';
import { residentAPI } from '../services/api';
import { MessageSquare, Heart, Pin, Send, Flag, Sparkles, User, AlertCircle, Plus } from 'lucide-react';

const CommunityBoardWidget = ({ city = 'Indore' }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [commentInputs, setCommentInputs] = useState({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', type: 'Discussion' });

  const loadPosts = async () => {
    try {
      setLoading(true);
      const res = await residentAPI.getCommunityPosts({ city, type: activeTab });
      setPosts(res.data || []);
    } catch (err) {
      console.error('Failed to load community posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, [city, activeTab]);

  const handleLike = async (id) => {
    try {
      const res = await residentAPI.toggleLikePost(id);
      setPosts(prev =>
        prev.map(p =>
          p._id === id
            ? { ...p, likes: res.hasLiked ? [...p.likes, 'me'] : p.likes.filter(l => l !== 'me') }
            : p
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddComment = async (postId) => {
    const text = commentInputs[postId];
    if (!text || !text.trim()) return;

    try {
      const res = await residentAPI.addComment(postId, text);
      setPosts(prev =>
        prev.map(p => (p._id === postId ? { ...p, comments: res.data } : p))
      );
      setCommentInputs(prev => ({ ...prev, [postId]: '' }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPost.title.trim() || !newPost.content.trim()) return;

    try {
      await residentAPI.createCommunityPost({ ...newPost, city });
      setShowCreateModal(false);
      setNewPost({ title: '', content: '', type: 'Discussion' });
      loadPosts();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <h3 className="font-bold text-slate-900 text-lg">Resident Living Community ({city})</h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Connect with co-residents, events, study sessions, and notices</p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex p-1 bg-slate-100 rounded-xl text-xs font-medium">
            {['All', 'Announcement', 'Discussion', 'Event'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  activeTab === tab
                    ? 'bg-white text-indigo-600 shadow-sm font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Post
          </button>
        </div>
      </div>

      {/* Posts stream */}
      {loading ? (
        <div className="p-8 text-center text-slate-400 text-sm">Loading community updates...</div>
      ) : posts.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-sm">
          No community discussions in {city} yet. Be the first to start a conversation!
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map(post => (
            <div
              key={post._id}
              className={`bg-white rounded-2xl p-5 border transition-all duration-200 shadow-sm hover:shadow-md ${
                post.pinned
                  ? 'border-indigo-200 bg-gradient-to-r from-indigo-50/30 via-white to-white'
                  : 'border-slate-200/80'
              }`}
            >
              {/* Post top */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold border border-slate-200">
                    {post.authorName?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-xs text-slate-900">{post.authorName}</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">
                        {post.authorRole || 'Resident'}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {new Date(post.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {post.pinned && (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                      <Pin className="w-3 h-3 rotate-45" />
                      Notice
                    </span>
                  )}
                  <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                    {post.type}
                  </span>
                </div>
              </div>

              {/* Title & Body */}
              <div className="mt-3">
                <h4 className="font-bold text-sm text-slate-900">{post.title}</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed whitespace-pre-line">{post.content}</p>
              </div>

              {/* Actions & Comment Count */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleLike(post._id)}
                    className="flex items-center gap-1 text-slate-500 hover:text-rose-600 transition-colors"
                  >
                    <Heart className="w-4 h-4" />
                    <span>{post.likes?.length || 0} Likes</span>
                  </button>
                  <span className="flex items-center gap-1 text-slate-500">
                    <MessageSquare className="w-4 h-4" />
                    <span>{post.comments?.length || 0} Comments</span>
                  </span>
                </div>
                <button
                  onClick={() => residentAPI.reportPost(post._id)}
                  className="flex items-center gap-1 text-slate-400 hover:text-amber-600 transition-colors text-[11px]"
                >
                  <Flag className="w-3 h-3" />
                  Report
                </button>
              </div>

              {/* Comments Section */}
              {post.comments && post.comments.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-50 space-y-2">
                  {post.comments.map((c, cIdx) => (
                    <div key={cIdx} className="bg-slate-50 p-2.5 rounded-xl text-xs flex items-start gap-2">
                      <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                        {c.authorName?.charAt(0) || 'U'}
                      </div>
                      <div className="flex-1">
                        <span className="font-semibold text-slate-800">{c.authorName}: </span>
                        <span className="text-slate-600">{c.text}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Comment Input */}
              <div className="mt-3 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Write a friendly reply..."
                  value={commentInputs[post._id] || ''}
                  onChange={(e) => setCommentInputs({ ...commentInputs, [post._id]: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddComment(post._id);
                  }}
                  className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 placeholder-slate-400"
                />
                <button
                  onClick={() => handleAddComment(post._id)}
                  className="p-1.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Post Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 border border-slate-200 text-slate-800">
            <h3 className="font-bold text-base text-slate-900 mb-3">Create Community Post</h3>
            <form onSubmit={handleCreatePost} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Post Category</label>
                <select
                  value={newPost.type}
                  onChange={(e) => setNewPost({ ...newPost, type: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                >
                  <option value="Discussion">Discussion</option>
                  <option value="Event">Event / Meetup</option>
                  <option value="Lost & Found">Lost & Found</option>
                  <option value="Announcement">Announcement</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Weekend study group at C21 Mall"
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Content</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Write your message or invitation..."
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3.5 py-2 text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md"
                >
                  Publish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityBoardWidget;
