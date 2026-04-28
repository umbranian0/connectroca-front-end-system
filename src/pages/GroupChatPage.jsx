import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchGroups, fetchPosts, fetchTopics } from '../api/conectraApi';
import { useAuth } from '../features/auth/useAuth';
import {
  formatRelativeTime,
  getEntityId,
  getRelationOne,
  getUserDisplayName,
} from '../utils/strapi';

function GroupChatPage() {
  const { groupId } = useParams();
  const { token } = useAuth();
  const [groups, setGroups] = useState([]);
  const [topics, setTopics] = useState([]);
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadConversation = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const [nextGroups, nextTopics, nextPosts] = await Promise.all([
        fetchGroups(token),
        fetchTopics(token),
        fetchPosts(token),
      ]);

      setGroups(nextGroups);
      setTopics(nextTopics);
      setPosts(nextPosts);
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : 'Unable to load group chat data from Strapi.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void loadConversation();
  }, [loadConversation]);

  const group = useMemo(
    () => groups.find((entry) => String(getEntityId(entry)) === String(groupId)) ?? null,
    [groupId, groups],
  );

  const relatedTopics = useMemo(() => {
    return topics.filter((topic) => {
      const relationGroup = getRelationOne(topic, 'group');
      return String(getEntityId(relationGroup)) === String(groupId);
    });
  }, [groupId, topics]);

  const activeTopic = relatedTopics[0] ?? topics[0] ?? null;

  const conversationMessages = useMemo(() => {
    if (!activeTopic) {
      return [];
    }

    const activeTopicId = String(getEntityId(activeTopic));

    return posts
      .filter((post) => {
        const topic = getRelationOne(post, 'topic');
        return String(getEntityId(topic)) === activeTopicId;
      })
      .sort(
        (a, b) =>
          new Date(a.postDate ?? a.createdAt ?? 0).getTime() -
          new Date(b.postDate ?? b.createdAt ?? 0).getTime(),
      );
  }, [activeTopic, posts]);

  return (
    <section className="page-section group-chat-page">
      <header className="panel-title-row">
        <div>
          <h1>{group?.name ?? 'Group Chat'}</h1>
          <p>{activeTopic?.title ?? 'Conversa geral'}</p>
        </div>

        <div className="inline-actions">
          <Link to={`/groups/${groupId}/members`} className="button button-secondary">
            Participantes
          </Link>
          <Link to="/groups" className="button button-secondary">
            Back
          </Link>
        </div>
      </header>

      {isLoading ? <p className="status-message">Loading conversation...</p> : null}
      {error ? <p className="status-error">{error}</p> : null}

      <ul className="chat-thread">
        {!isLoading && !error && conversationMessages.length === 0 ? (
          <li className="chat-bubble">
            <p className="status-message">Ainda não existem mensagens para este grupo.</p>
          </li>
        ) : null}

        {conversationMessages.map((post, index) => {
          const author = getRelationOne(post, 'author');
          const isAlternate = index % 2 === 1;

          return (
            <li key={getEntityId(post) ?? index} className={isAlternate ? 'chat-bubble alt' : 'chat-bubble'}>
              <header>
                <strong>{getUserDisplayName(author)}</strong>
                <small>{formatRelativeTime(post.postDate ?? post.createdAt)}</small>
              </header>
              <p>{post.content ?? 'Mensagem vazia.'}</p>
            </li>
          );
        })}
      </ul>

      <footer className="chat-input-wrap">
        <input type="text" placeholder="Pergunte qualquer coisa" disabled />
        <button type="button" className="button button-primary" disabled>
          ?
        </button>
      </footer>
    </section>
  );
}

export default GroupChatPage;
