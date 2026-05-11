import { useEffect, useState } from 'react';
import { fetchTopics } from '../api/conectraApi';
import { createAccount, createGroup, createPost } from '../api/formsApi';
import { useAuth } from '../features/auth/useAuth';
import { getEntityId } from '../utils/strapi';

const ACCOUNT_INITIAL_STATE = {
  username: '',
  email: '',
  password: '',
};

const POST_INITIAL_STATE = {
  content: '',
  topicId: '',
  publishNow: true,
  postDate: '',
};

const GROUP_INITIAL_STATE = {
  name: '',
  description: '',
  memberLimit: '30',
  location: '',
  schedule: '',
  status: 'open',
};

function toPreview(payload) {
  return JSON.stringify(payload, null, 2);
}

function FormField({ id, label, error, help, children }) {
  return (
    <label className="form-field" htmlFor={id}>
      <span>{label}</span>
      {children}
      {help ? <small className="form-help">{help}</small> : null}
      {error ? <small className="form-error">{error}</small> : null}
    </label>
  );
}

function FormExamplesPage() {
  const { token, isAuthenticated } = useAuth();

  const [topics, setTopics] = useState([]);
  const [topicsError, setTopicsError] = useState('');

  const [accountForm, setAccountForm] = useState(ACCOUNT_INITIAL_STATE);
  const [accountErrors, setAccountErrors] = useState({});
  const [accountStatus, setAccountStatus] = useState({ isSubmitting: false, error: '', success: '', preview: '' });

  const [postForm, setPostForm] = useState(POST_INITIAL_STATE);
  const [postErrors, setPostErrors] = useState({});
  const [postStatus, setPostStatus] = useState({ isSubmitting: false, error: '', success: '', preview: '' });

  const [groupForm, setGroupForm] = useState(GROUP_INITIAL_STATE);
  const [groupErrors, setGroupErrors] = useState({});
  const [groupStatus, setGroupStatus] = useState({ isSubmitting: false, error: '', success: '', preview: '' });

  useEffect(() => {
    let isMounted = true;

    async function loadTopics() {
      setTopicsError('');

      try {
        const nextTopics = await fetchTopics(token);

        if (isMounted) {
          setTopics(nextTopics);
        }
      } catch (requestError) {
        const message = requestError instanceof Error ? requestError.message : 'Unable to load topics.';

        if (isMounted) {
          setTopics([]);
          setTopicsError(message);
        }
      }
    }

    void loadTopics();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleAccountChange = (field) => (event) => {
    setAccountForm((current) => ({
      ...current,
      [field]: event.target.value,
    }));
  };

  const handlePostChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;

    setPostForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleGroupChange = (field) => (event) => {
    setGroupForm((current) => ({
      ...current,
      [field]: event.target.value,
    }));
  };

  const validateAccount = () => {
    const errors = {};

    if (!accountForm.username.trim()) {
      errors.username = 'Username is required.';
    }

    if (!accountForm.email.includes('@')) {
      errors.email = 'Please provide a valid email.';
    }

    if (accountForm.password.length < 8) {
      errors.password = 'Password must have at least 8 characters.';
    }

    return errors;
  };

  const validatePost = () => {
    const errors = {};

    if (!postForm.content.trim()) {
      errors.content = 'Post content is required.';
    }

    const topicId = postForm.topicId.trim();
    if (topicId && !/^\d+$/.test(topicId)) {
      errors.topicId = 'Topic ID must be numeric.';
    }

    if (!postForm.publishNow && !postForm.postDate) {
      errors.postDate = 'Choose a post date or enable publish now.';
    }

    if (!postForm.publishNow && postForm.postDate && Number.isNaN(new Date(postForm.postDate).getTime())) {
      errors.postDate = 'Post date is invalid.';
    }

    return errors;
  };

  const validateGroup = () => {
    const errors = {};

    if (!groupForm.name.trim()) {
      errors.name = 'Group name is required.';
    }

    if (!/^\d+$/.test(groupForm.memberLimit) || Number(groupForm.memberLimit) < 1) {
      errors.memberLimit = 'Member limit must be an integer >= 1.';
    }

    return errors;
  };

  const handleAccountSubmit = async (event) => {
    event.preventDefault();

    const errors = validateAccount();
    setAccountErrors(errors);

    if (Object.keys(errors).length > 0) {
      setAccountStatus((current) => ({ ...current, preview: '', success: '' }));
      return;
    }

    setAccountStatus({ isSubmitting: true, error: '', success: '', preview: '' });

    try {
      const created = await createAccount(accountForm, token);

      setAccountStatus({
        isSubmitting: false,
        error: '',
        success: 'Account created in Strapi.',
        preview: toPreview(created),
      });

      setAccountForm(ACCOUNT_INITIAL_STATE);
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : 'Unable to create account.';
      setAccountStatus({ isSubmitting: false, error: message, success: '', preview: '' });
    }
  };

  const handlePostSubmit = async (event) => {
    event.preventDefault();

    const errors = validatePost();
    setPostErrors(errors);

    if (Object.keys(errors).length > 0) {
      setPostStatus((current) => ({ ...current, preview: '', success: '' }));
      return;
    }

    if (!isAuthenticated) {
      setPostStatus({ isSubmitting: false, error: 'Login is required to create a post.', success: '', preview: '' });
      return;
    }

    setPostStatus({ isSubmitting: true, error: '', success: '', preview: '' });

    const finalPostDate = postForm.publishNow
      ? new Date().toISOString()
      : new Date(postForm.postDate).toISOString();

    try {
      const created = await createPost(
        {
          content: postForm.content,
          topicId: postForm.topicId,
          postDate: finalPostDate,
        },
        token,
      );

      setPostStatus({
        isSubmitting: false,
        error: '',
        success: 'Post created in Strapi.',
        preview: toPreview(created),
      });

      setPostForm(POST_INITIAL_STATE);
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : 'Unable to create post.';
      setPostStatus({ isSubmitting: false, error: message, success: '', preview: '' });
    }
  };

  const handleGroupSubmit = async (event) => {
    event.preventDefault();

    const errors = validateGroup();
    setGroupErrors(errors);

    if (Object.keys(errors).length > 0) {
      setGroupStatus((current) => ({ ...current, preview: '', success: '' }));
      return;
    }

    if (!isAuthenticated) {
      setGroupStatus({ isSubmitting: false, error: 'Login is required to create a group.', success: '', preview: '' });
      return;
    }

    setGroupStatus({ isSubmitting: true, error: '', success: '', preview: '' });

    try {
      const created = await createGroup(groupForm, token);

      setGroupStatus({
        isSubmitting: false,
        error: '',
        success: 'Group created in Strapi.',
        preview: toPreview(created),
      });

      setGroupForm(GROUP_INITIAL_STATE);
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : 'Unable to create group.';
      setGroupStatus({ isSubmitting: false, error: message, success: '', preview: '' });
    }
  };

  return (
    <section className="page-section forms-page">
      <header className="panel-title-row">
        <div>
          <h1>Form Examples Playground</h1>
          <p>These forms now submit directly to Strapi endpoints.</p>
        </div>
      </header>

      <p className="status-message">
        Account creation uses Strapi register endpoint. Post and group creation use authenticated requests.
      </p>

      {!isAuthenticated ? (
        <p className="status-message">Log in first if your Strapi permissions require authentication for creating posts and groups.</p>
      ) : null}

      <div className="forms-grid">
        <article className="form-card">
          <h2>Create Account</h2>
          <p className="form-intro">Calls `POST /api/auth/local/register` (with token fallback when needed).</p>

          <form className="example-form" onSubmit={handleAccountSubmit} noValidate>
            <FormField id="account-username" label="Username" error={accountErrors.username}>
              <input
                id="account-username"
                type="text"
                value={accountForm.username}
                onChange={handleAccountChange('username')}
                placeholder="student_name"
              />
            </FormField>

            <FormField id="account-email" label="Email" error={accountErrors.email}>
              <input
                id="account-email"
                type="email"
                value={accountForm.email}
                onChange={handleAccountChange('email')}
                placeholder="student@school.edu"
              />
            </FormField>

            <FormField id="account-password" label="Password" error={accountErrors.password} help="Minimum 8 characters.">
              <input
                id="account-password"
                type="password"
                value={accountForm.password}
                onChange={handleAccountChange('password')}
                placeholder="********"
              />
            </FormField>

            <div className="inline-actions">
              <button type="submit" className="button button-primary" disabled={accountStatus.isSubmitting}>
                {accountStatus.isSubmitting ? 'Creating account...' : 'Create account'}
              </button>
              <button
                type="button"
                className="button button-secondary"
                onClick={() => {
                  setAccountForm(ACCOUNT_INITIAL_STATE);
                  setAccountErrors({});
                  setAccountStatus({ isSubmitting: false, error: '', success: '', preview: '' });
                }}
              >
                Reset
              </button>
            </div>
          </form>

          {accountStatus.error ? <p className="status-error">{accountStatus.error}</p> : null}
          {accountStatus.success ? <p className="status-success">{accountStatus.success}</p> : null}
          {accountStatus.preview ? <pre className="form-preview">{accountStatus.preview}</pre> : null}
        </article>

        <article className="form-card">
          <h2>Create Post</h2>
          <p className="form-intro">Calls `POST /api/posts` with the Strapi `data` wrapper.</p>

          <form className="example-form" onSubmit={handlePostSubmit} noValidate>
            <FormField id="post-content" label="Content" error={postErrors.content}>
              <textarea
                id="post-content"
                rows={6}
                value={postForm.content}
                onChange={handlePostChange('content')}
                placeholder="Write your post content"
              />
            </FormField>

            <FormField id="post-topic-id" label="Topic relation (optional)" error={postErrors.topicId}>
              <select id="post-topic-id" value={postForm.topicId} onChange={handlePostChange('topicId')}>
                <option value="">No topic relation</option>
                {topics.map((topic) => {
                  const topicId = getEntityId(topic);

                  return (
                    <option key={topicId} value={String(topicId)}>
                      {topic.title ?? `Topic ${topicId}`} (ID: {topicId})
                    </option>
                  );
                })}
              </select>
            </FormField>

            {topicsError ? <small className="form-error">{topicsError}</small> : null}

            <label className="checkbox-row" htmlFor="post-publish-now">
              <input
                id="post-publish-now"
                type="checkbox"
                checked={postForm.publishNow}
                onChange={handlePostChange('publishNow')}
              />
              <span>Use current time as post date</span>
            </label>

            {!postForm.publishNow ? (
              <FormField id="post-date" label="Post date" error={postErrors.postDate}>
                <input
                  id="post-date"
                  type="datetime-local"
                  value={postForm.postDate}
                  onChange={handlePostChange('postDate')}
                />
              </FormField>
            ) : null}

            <div className="inline-actions">
              <button type="submit" className="button button-primary" disabled={postStatus.isSubmitting || !isAuthenticated}>
                {postStatus.isSubmitting ? 'Creating post...' : 'Create post'}
              </button>
              <button
                type="button"
                className="button button-secondary"
                onClick={() => {
                  setPostForm(POST_INITIAL_STATE);
                  setPostErrors({});
                  setPostStatus({ isSubmitting: false, error: '', success: '', preview: '' });
                }}
              >
                Reset
              </button>
            </div>
          </form>

          {postStatus.error ? <p className="status-error">{postStatus.error}</p> : null}
          {postStatus.success ? <p className="status-success">{postStatus.success}</p> : null}
          {postStatus.preview ? <pre className="form-preview">{postStatus.preview}</pre> : null}
        </article>

        <article className="form-card">
          <h2>Create Group (Other Example)</h2>
          <p className="form-intro">Calls `POST /api/groups` and is meant as a customizable baseline.</p>

          <form className="example-form" onSubmit={handleGroupSubmit} noValidate>
            <FormField id="group-name" label="Group name" error={groupErrors.name}>
              <input
                id="group-name"
                type="text"
                value={groupForm.name}
                onChange={handleGroupChange('name')}
                placeholder="Operating Systems Study Team"
              />
            </FormField>

            <FormField id="group-description" label="Description">
              <textarea
                id="group-description"
                rows={4}
                value={groupForm.description}
                onChange={handleGroupChange('description')}
                placeholder="Purpose, scope, and expected collaboration style"
              />
            </FormField>

            <div className="form-row">
              <FormField id="group-member-limit" label="Member limit" error={groupErrors.memberLimit}>
                <input
                  id="group-member-limit"
                  type="number"
                  min={1}
                  value={groupForm.memberLimit}
                  onChange={handleGroupChange('memberLimit')}
                />
              </FormField>

              <FormField id="group-status" label="Status">
                <select id="group-status" value={groupForm.status} onChange={handleGroupChange('status')}>
                  <option value="open">Open</option>
                  <option value="closed">Closed</option>
                </select>
              </FormField>
            </div>

            <FormField id="group-location" label="Location (optional)">
              <input
                id="group-location"
                type="text"
                value={groupForm.location}
                onChange={handleGroupChange('location')}
                placeholder="Room B-204"
              />
            </FormField>

            <FormField id="group-schedule" label="Schedule (optional)">
              <input
                id="group-schedule"
                type="text"
                value={groupForm.schedule}
                onChange={handleGroupChange('schedule')}
                placeholder="Tuesdays at 18:00"
              />
            </FormField>

            <div className="inline-actions">
              <button
                type="submit"
                className="button button-primary"
                disabled={groupStatus.isSubmitting || !isAuthenticated}
              >
                {groupStatus.isSubmitting ? 'Creating group...' : 'Create group'}
              </button>
              <button
                type="button"
                className="button button-secondary"
                onClick={() => {
                  setGroupForm(GROUP_INITIAL_STATE);
                  setGroupErrors({});
                  setGroupStatus({ isSubmitting: false, error: '', success: '', preview: '' });
                }}
              >
                Reset
              </button>
            </div>
          </form>

          {groupStatus.error ? <p className="status-error">{groupStatus.error}</p> : null}
          {groupStatus.success ? <p className="status-success">{groupStatus.success}</p> : null}
          {groupStatus.preview ? <pre className="form-preview">{groupStatus.preview}</pre> : null}
        </article>
      </div>
    </section>
  );
}

export default FormExamplesPage;

