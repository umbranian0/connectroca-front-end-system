import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { fetchPost } from '../api/conectraApi';
import { createPost, updatePost } from '../api/formsApi';
import { useAuth } from '../features/auth/useAuth';
import { useI18n } from '../features/i18n/useI18n';
import { getEntityId } from '../utils/strapi';

const INITIAL_FORM_STATE = {
  content: '',
  topicId: '',
  publishNow: true,
  postDate: '',
};

function PostEditorPage() {
  const { postId } = useParams();
  const { token, isAuthenticated } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const isEditMode = Boolean(postId);

  const [formState, setFormState] = useState(INITIAL_FORM_STATE);
  const [formErrors, setFormErrors] = useState({});
  const [statusMessage, setStatusMessage] = useState({ isSubmitting: false, error: '', success: '' });
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadPost() {
      if (!postId) {
        setIsLoading(false);
        return;
      }

      try {
        const fetchedPost = await fetchPost(postId, token);
        if (!isMounted) {
          return;
        }

        if (!fetchedPost) {
          setLoadError(t('posts.loadPostError'));
          return;
        }

        setFormState({
          content: fetchedPost.content ?? '',
          topicId: fetchedPost.topic?.id ? String(getEntityId(fetchedPost.topic)) : '',
          publishNow: false,
          postDate: fetchedPost.postDate ? new Date(fetchedPost.postDate).toISOString().slice(0, 16) : '',
        });
      } catch (requestError) {
        const message = requestError instanceof Error ? requestError.message : t('posts.loadPostError');
        setLoadError(message);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadPost();

    return () => {
      isMounted = false;
    };
  }, [postId, t, token]);

  const validateForm = () => {
    const errors = {};

    if (!formState.content.trim()) {
      errors.content = t('posts.contentRequired');
    }

    const topicId = formState.topicId.trim();
    if (topicId && !/^[0-9]+$/.test(topicId)) {
      errors.topicId = t('posts.topicIdInvalid');
    }

    if (!formState.publishNow && !formState.postDate) {
      errors.postDate = t('posts.invalidDate');
    }

    if (!formState.publishNow && formState.postDate && Number.isNaN(new Date(formState.postDate).getTime())) {
      errors.postDate = t('posts.invalidDate');
    }

    return errors;
  };

  const handleChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setFormState((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const errors = validateForm();
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      setStatusMessage((current) => ({ ...current, success: '' }));
      return;
    }

    if (!isAuthenticated) {
      setStatusMessage({ isSubmitting: false, error: t('posts.loginRequired'), success: '' });
      return;
    }

    setStatusMessage({ isSubmitting: true, error: '', success: '' });

    const payload = {
      content: formState.content,
      topicId: formState.topicId,
      postDate: formState.publishNow
        ? new Date().toISOString()
        : new Date(formState.postDate).toISOString(),
    };

    try {
      if (isEditMode) {
        await updatePost(postId, payload, token);
        setStatusMessage({ isSubmitting: false, error: '', success: t('posts.postUpdated') });
      } else {
        await createPost(payload, token);
        setStatusMessage({ isSubmitting: false, error: '', success: t('posts.postCreated') });
        setFormState(INITIAL_FORM_STATE);
      }
      navigate('/posts');
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : t('posts.loadError');
      setStatusMessage({ isSubmitting: false, error: message, success: '' });
    }
  };

  const pageTitle = isEditMode ? t('posts.editTitle') : t('posts.createTitle');

  return (
    <section className="page-section post-editor-page">
      <header className="panel-title-row">
        <div>
          <h1>{pageTitle}</h1>
          <p>{t('posts.editorSubtitle')}</p>
        </div>

        <Link className="button button-secondary" to="/posts">
          {t('posts.backToPosts')}
        </Link>
      </header>

      {isLoading ? <p className="status-message">{t('common.loading')}</p> : null}
      {loadError ? <p className="status-error">{loadError}</p> : null}

      {!isLoading && !loadError ? (
        <form className="example-form" onSubmit={handleSubmit} noValidate>
          <label className="form-field" htmlFor="post-content">
            <span>{t('posts.contentLabel')}</span>
            <textarea
              id="post-content"
              rows={6}
              value={formState.content}
              onChange={handleChange('content')}
              placeholder={t('posts.contentPlaceholder')}
            />
            {formErrors.content ? <small className="form-error">{formErrors.content}</small> : null}
          </label>

          <label className="form-field" htmlFor="post-topic-id">
            <span>{t('posts.topicRelationLabel')}</span>
            <input
              id="post-topic-id"
              type="text"
              value={formState.topicId}
              onChange={handleChange('topicId')}
              placeholder={t('posts.topicIdPlaceholder')}
            />
            {formErrors.topicId ? <small className="form-error">{formErrors.topicId}</small> : null}
          </label>

          <label className="checkbox-row" htmlFor="post-publish-now">
            <input
              id="post-publish-now"
              type="checkbox"
              checked={formState.publishNow}
              onChange={handleChange('publishNow')}
            />
            <span>{t('posts.publishNowLabel')}</span>
          </label>

          {!formState.publishNow ? (
            <label className="form-field" htmlFor="post-date">
              <span>{t('posts.postDateLabel')}</span>
              <input
                id="post-date"
                type="datetime-local"
                value={formState.postDate}
                onChange={handleChange('postDate')}
              />
              {formErrors.postDate ? <small className="form-error">{formErrors.postDate}</small> : null}
            </label>
          ) : null}

          {statusMessage.error ? <p className="status-error">{statusMessage.error}</p> : null}
          {statusMessage.success ? <p className="status-success">{statusMessage.success}</p> : null}

          <div className="inline-actions">
            <button type="submit" className="button button-primary" disabled={statusMessage.isSubmitting}>
              {statusMessage.isSubmitting ? t('common.loading') : isEditMode ? t('posts.submitUpdate') : t('posts.submitCreate')}
            </button>
            <button
              type="button"
              className="button button-secondary"
              onClick={() => {
                setFormState(INITIAL_FORM_STATE);
                setFormErrors({});
                setStatusMessage({ isSubmitting: false, error: '', success: '' });
              }}
            >
              {t('common.refresh')}
            </button>
          </div>
        </form>
      ) : null}
    </section>
  );
}

export default PostEditorPage;
