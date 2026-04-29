import React, { useState } from 'react';
import { useSettings } from '@context/SettingsContext';

type UserSession = {
    id: string;
    username: string;
    email: string;
    role: 'USER' | 'CREATOR' | 'ADMIN';
    status: 'Active' | 'Suspended';
    reportsCnt: number;
};



export const UserModerationTable = () => {
    const { t } = useSettings();
    const [users, setUsers] = useState<UserSession[]>([]);
    const [search, setSearch] = useState('');
    const [modal, setModal] = useState<{ isOpen: boolean; actionType: 'Ban' | 'Delete'; user: UserSession | null }>({ isOpen: false, actionType: 'Ban', user: null });
    const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());

    const toggleUser = (id: string) => {
        setExpandedUsers(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const filteredUsers = users.filter(u => u.username.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

    const handleConfirmAction = () => {
        if (!modal.user) return;
        
        if (modal.actionType === 'Ban') {
            setUsers(prev => prev.map(u => u.id === modal.user!.id ? { ...u, status: u.status === 'Active' ? 'Suspended' : 'Active' } : u));
        } else if (modal.actionType === 'Delete') {
            setUsers(prev => prev.filter(u => u.id !== modal.user!.id));
        }
        setModal({ isOpen: false, actionType: 'Ban', user: null });
    };

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden relative">
            
            {/* Modal de Confirmación Doble */}
            {modal.isOpen && modal.user && (
                <div className="absolute inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-lg shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-200">
                        <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                            {modal.actionType === 'Ban' ? 'Confirm Status Change' : 'Delete Data Completely'}
                        </h4>
                        <p className="text-sm text-slate-500 text-slate-400 mb-6">
                            {modal.actionType === 'Ban' 
                                ? `Are you sure you want to change the suspension status for ${modal.user.username}?` 
                                : `Are you sure you want to completely delete all data associated with ${modal.user.username}? This respects GDPR/ARCO but is irreversible.`
                            }
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button onClick={() => setModal({ isOpen: false, actionType: 'Ban', user: null })} className="px-4 py-2 rounded text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition">Cancel</button>
                            <button onClick={handleConfirmAction} className={`px-4 py-2 rounded text-white font-medium transition ${modal.actionType === 'Delete' ? 'bg-red-600 hover:bg-red-700' : 'bg-orange-500 hover:bg-orange-600'}`}>
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                        {t.admin?.moderation || 'User Moderation'}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Handle user reports, bans, and data deletion requests.
                    </p>
                </div>
                <div className="w-full md:w-64">
                    <input 
                        type="text" 
                        placeholder="Search users..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none"
                    />
                </div>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left block sm:table">
                    <thead className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 hidden sm:table-header-group">
                        <tr>
                            <th className="px-6 py-4 font-medium uppercase tracking-wider">User</th>
                            <th className="px-6 py-4 font-medium uppercase tracking-wider">Role</th>
                            <th className="px-6 py-4 font-medium uppercase tracking-wider">Reports</th>
                            <th className="px-6 py-4 font-medium uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 font-medium uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="block sm:table-row-group divide-y divide-slate-200 dark:divide-slate-800">
                        {filteredUsers.map(user => {
                            const isExpanded = expandedUsers.has(user.id);
                            return (
                            <tr key={user.id} className="block sm:table-row hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors mb-6 sm:mb-0 border border-slate-200 dark:border-slate-800 sm:border-0 rounded-lg sm:rounded-none overflow-hidden">
                                <td 
                                    onClick={() => toggleUser(user.id)}
                                    className="block sm:table-cell px-4 sm:px-6 py-3 sm:py-4 bg-slate-50/50 sm:bg-transparent dark:bg-slate-800/40 sm:dark:bg-transparent border-b sm:border-0 border-slate-200 dark:border-slate-800 cursor-pointer sm:cursor-auto"
                                >
                                    <div className="flex justify-between items-center w-full">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-slate-900 dark:text-slate-100">{user.username}</span>
                                            <span className="text-xs text-slate-500">{user.email}</span>
                                        </div>
                                        <div className="sm:hidden text-slate-400">
                                            <svg className={`w-5 h-5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>
                                </td>
                                <td className={`${isExpanded ? 'flex' : 'hidden'} justify-between items-center sm:table-cell px-4 sm:px-6 py-3 sm:py-4 align-middle border-b sm:border-0 border-slate-100 dark:border-slate-800/50`}>
                                    <span className="sm:hidden font-semibold text-xs text-slate-500 dark:text-slate-400">Role</span>
                                    <span className="text-xs font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-700 dark:text-slate-300">{user.role}</span>
                                </td>
                                <td className={`${isExpanded ? 'flex' : 'hidden'} justify-between items-center sm:table-cell px-4 sm:px-6 py-3 sm:py-4 align-middle border-b sm:border-0 border-slate-100 dark:border-slate-800/50`}>
                                    <span className="sm:hidden font-semibold text-xs text-slate-500 dark:text-slate-400">Reports</span>
                                    <span className={`font-semibold ${user.reportsCnt > 5 ? 'text-red-500' : 'text-slate-500'}`}>
                                        {user.reportsCnt}
                                    </span>
                                </td>
                                <td className={`${isExpanded ? 'flex' : 'hidden'} justify-between items-center sm:table-cell px-4 sm:px-6 py-3 sm:py-4 align-middle border-b sm:border-0 border-slate-100 dark:border-slate-800/50`}>
                                    <span className="sm:hidden font-semibold text-xs text-slate-500 dark:text-slate-400">Status</span>
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold
                                        ${user.status === 'Active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 
                                         'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'}
                                    `}>
                                        {user.status}
                                    </span>
                                </td>
                                <td className={`${isExpanded ? 'flex' : 'hidden'} sm:table-cell flex-row sm:flex-col items-center justify-between px-4 sm:px-6 py-3 sm:py-4 text-right align-middle`}>
                                    <span className="sm:hidden font-semibold text-xs text-slate-500 dark:text-slate-400">Actions</span>
                                    <div className="flex flex-col sm:items-end gap-3 py-1">
                                        <button 
                                            onClick={() => setModal({ isOpen: true, actionType: 'Ban', user })}
                                            className="text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-300 font-medium text-xs uppercase whitespace-nowrap text-right"
                                        >
                                            {user.status === 'Active' ? t.admin?.banBtn || 'Ban' : t.admin?.unbanBtn || 'Unban'}
                                        </button>
                                        <button 
                                            onClick={() => setModal({ isOpen: true, actionType: 'Delete', user })}
                                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-medium text-xs uppercase whitespace-nowrap text-right"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
