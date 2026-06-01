import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createPost, fetchPostById, updatePost } from '../api/postsApi';
import { useAuth } from '../features/auth/useAuth';
import { useI18n } from '../features/i18n/useI18n';

function PostEditorPage() {
  const { postId } = useParams();
  const { user } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [isLoading, setIsLoading] = useState(Boolean(postId));
  const [error, setError] = useState('');

  const authorName = user?.username ?? user?.email ?? t('format.communityMember');
  const isEditMode = Boolean(postId);

  useEffect(() => {
    if (!postId) {
      return;
    }

    const loadPost = async () => {
      setIsLoading(true);
      setError('');

      try {
        const storedPost = await fetchPostById(postId);

        if (!storedPost) {
          setError(t('posts.notFound'));
          return;
        }

        setTitle(storedPost.title ?? '');
        setBody(storedPost.body ?? '');
      } catch (requestError) {
        const message = requestError instanceof Error ? requestError.message : t('posts.loadError');
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    void loadPost();
  }, [postId, t]);

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      setError('');

      if (!title.trim()) {
        setError(t('posts.validationTitle'));
        return;
      }

      if (!body.trim()) {
        setError(t('posts.validationBody'));
        return;
      }

      try {
        if (isEditMode) {
          await updatePost(postId, { title: title.trim(), body: body.trim() });
        } else {
          await createPost({ title: title.trim(), body: body.trim(), author: authorName });
        }

        navigate('/posts');
      } catch (requestError) {
        const message = requestError instanceof Error ? requestError.message : t('posts.saveError');
        setError(message);
      }
    },
    [authorName, body, isEditMode, navigate, postId, t, title],
  );

  return (
    <section className="page-section post-editor-page">
      <header className="panel-title-row">
        <div>
          <h1>{isEditMode ? t('posts.editPost') : t('posts.createPost')}</h1>
          <p>{t('posts.editorSubtitle')}</p>
        </div>
      </header>

      {isLoading ? <p className="status-message">{t('posts.loading')}</p> : null}
      {error ? <p className="status-error">{error}</p> : null}

      {!isLoading ? (
        <form onSubmit={handleSubmit} className="form-panel">
          <label className="form-field" htmlFor="post-title">
            <span>{t('posts.titleLabel')}</span>
            <input
              id="post-title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder={t('posts.titlePlaceholder')}
            />
          </label>

          <label className="form-field" htmlFor="post-body">
            <span>{t('posts.bodyLabel')}</span>
            <textarea
              id="post-body"
              rows={8}
              value={body}
              onChange={(event) => setBody(event.target.value)}
              placeholder={t('posts.bodyPlaceholder')}
            />
          </label>

          <div className="form-actions">
            <button type="button" className="button button-secondary" onClick={() => navigate('/posts')}>
              {t('common.back')}
            </button>
            <button type="submit" className="button button-primary">
              {t('posts.save')}
            </button>
          </div>
        </form>
      ) : null}
    </section>
  );
}

export default PostEditorPage;
