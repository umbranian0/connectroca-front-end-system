import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../features/auth/useAuth';
import { fetchUserById } from '../api/usersApi';
import PageContainer from '../components/PageContainer';

function UserProfilePage() {
  const { id } = useParams();
  const { user: authUser, token, isLoading: authLoading } = useAuth();

  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadUser() {
      setError('');
      setIsLoading(true);

      if (!id) {
        if (authUser) {
          setUser(authUser);
          setIsLoading(false);
          return;
        }

        setError('Por favor faça login para ver o perfil.');
        setIsLoading(false);
        return;
      }

      if (authUser?.id?.toString() === id.toString()) {
        setUser(authUser);
        setIsLoading(false);
        return;
      }

      try {
        const data = await fetchUserById(id, token);
        setUser(data);
      } catch (err) {
        console.error(err);
        setError('Erro ao carregar utilizador');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    if (authLoading) {
      return;
    }

    void loadUser();
  }, [id, authUser, token, authLoading]);

  const isOwnProfile = !id || authUser?.id?.toString() === id?.toString();

  if (isLoading) {
    return <p>A carregar...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <PageContainer
      title={isOwnProfile ? 'Meu perfil' : 'Perfil'}
      description={
        isOwnProfile
          ? 'Perfil do utilizador autenticado'
          : 'Perfil individual do utilizador'
      }
    >
      <div className="entity-card">
        <h2>{user.username ?? user.email}</h2>

        <p>
          <strong>Email:</strong> {user.email}
        </p>

        <p>
          <strong>ID:</strong> {user.id}
        </p>
      </div>
    </PageContainer>
  );
}

export default UserProfilePage;