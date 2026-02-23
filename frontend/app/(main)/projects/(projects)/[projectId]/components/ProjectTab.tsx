'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import classNames from 'classnames/bind';
import Input from '@/shared/components/Input';
import Dropdown from '@/shared/components/Dropdown';
import PopoverMenu from '@/shared/components/PopoverMenu';
import SortIcon from '@/public/assets/sort.svg';
import SearchIcon from '@/public/assets/search.svg';
import PlusIcon from '@/public/assets/plus.svg';
import styles from './ProjectTab.module.css';
import CreateTaskModal from './CreateTaskModal';
import CreateAITaskModal from './CreateAITaskModal';
import MemberTabMenu from './MemberTabMenu';
import { User } from '@/types/entities';

const cx = classNames.bind(styles);

const TaskTabMenu = ({
  projectId,
  members,
}: {
  projectId: number;
  members: User[];
}) => {
  const params = useSearchParams();
  const router = useRouter();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [isCreateAITaskOpen, setIsCreateAITaskOpen] = useState(false);

  const handleSearch = (formData: FormData) => {
    const searchParams = new URLSearchParams(params);
    const keyword = formData.get('keyword');
    if (keyword) {
      searchParams.set('keyword', keyword as string);
    } else {
      searchParams.delete('keyword');
    }
    searchParams.delete('page');
    router.push(`?${searchParams.toString()}`);
  };

  const handleStatusChange = (value: string) => {
    const searchParams = new URLSearchParams(params);
    if (value === 'all') {
      searchParams.delete('status');
    } else {
      searchParams.set('status', value);
    }
    searchParams.delete('page');
    router.push(`?${searchParams.toString()}`);
  };
  const handleAssigneeChange = (value: string) => {
    const searchParams = new URLSearchParams(params);
    if (value === 'all') {
      searchParams.delete('assignee');
    } else {
      searchParams.set('assignee', value);
    }
    searchParams.delete('page');
    router.push(`?${searchParams.toString()}`);
  };

  const handleSortChange = (value: string) => {
    const searchParams = new URLSearchParams(params);
    searchParams.set('order_by', value);
    searchParams.delete('page');
    router.push(`?${searchParams.toString()}`);
  };

  return (
    <div className={cx('taskTabMenu')}>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <PlusIcon
          className={cx('createTaskButton')}
          onClick={() => setIsCreateTaskOpen(true)}
        />
        <button
          onClick={() => setIsCreateAITaskOpen(true)}
          className={cx('createAITaskButton')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            backgroundColor: '#3182F6',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: '0 4px 12px -2px rgba(59, 130, 246, 0.4)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#2870db';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#3182F6';
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            className="w-4 h-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z"
            />
          </svg>
          <span>AI로 만들기</span>
        </button>
      </div>
      <CreateTaskModal
        projectId={projectId}
        isOpen={isCreateTaskOpen}
        onClose={() => setIsCreateTaskOpen(false)}
        onSubmit={() => setIsCreateTaskOpen(false)}
      />
      <CreateAITaskModal
        projectId={projectId}
        isOpen={isCreateAITaskOpen}
        onClose={() => setIsCreateAITaskOpen(false)}
        onSubmit={() => setIsCreateAITaskOpen(false)}
      />
      <form className={cx('searchForm')} action={handleSearch}>
        {isSearchOpen ? (
          <Input
            search
            autoFocus
            name="keyword"
            className={cx('searchInput')}
            defaultValue={params.get('keyword') || ''}
            placeholder="이름으로 검색하기"
            onBlur={() => setIsSearchOpen(false)}
          />
        ) : (
          <SearchIcon
            className={cx('searchIcon')}
            onClick={() => {
              setIsSearchOpen(true);
            }}
          />
        )}
      </form>
      <PopoverMenu
        icon={<SortIcon />}
        options={[
          {
            label: '생성순',
            value: 'created_at',
          },
          {
            label: '이름순',
            value: 'title',
          },
          {
            label: '기한임박순',
            value: 'end_date',
          },
        ]}
        value={params.get('order_by') || ''}
        onChange={handleSortChange}
      />
      <Dropdown
        options={[
          { label: '전체', value: 'all' },
          { label: '진행 전', value: 'todo' },
          { label: '진행 중', value: 'in_progress' },
          { label: '완료', value: 'done' },
        ]}
        value={params.get('status') || ''}
        onChange={handleStatusChange}
        placeholder="상태"
      />
      <Dropdown
        className={cx('assigneeDropdown')}
        options={[
          { label: '전체', value: 'all' },
          ...members.map((member) => ({
            label: member.name,
            value: member.id.toString(),
          })),
        ]}
        value={params.get('assignee') || ''}
        onChange={handleAssigneeChange}
        placeholder="담당자"
      />
    </div>
  );
};

const ProjectTab = ({
  projectId,
  members,
}: {
  projectId: number;
  members: User[];
}) => {
  const pathname = usePathname();
  const currentTab: 'tasks' | 'members' = (() => {
    if (pathname === `/projects/${projectId}/tasks`) return 'tasks';
    if (pathname === `/projects/${projectId}/members`) return 'members';
    return 'tasks';
  })();

  return (
    <div className={cx('container')}>
      <div className={cx('tabs')}>
        <Link
          className={cx('tab', { active: currentTab === 'tasks' })}
          href={`/projects/${projectId}/tasks`}
        >
          할 일 목록
        </Link>
        <Link
          className={cx('tab', { active: currentTab === 'members' })}
          href={`/projects/${projectId}/members`}
        >
          멤버 목록
        </Link>
      </div>
      <div>
        {currentTab === 'tasks' && (
          <TaskTabMenu projectId={projectId} members={members} />
        )}
        {currentTab === 'members' && <MemberTabMenu projectId={projectId} />}
      </div>
    </div>
  );
};

export default ProjectTab;
