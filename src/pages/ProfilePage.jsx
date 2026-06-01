import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  createProfile,
  fetchMaterials,
  fetchProfiles,
  fetchTopics,
  fetchUserAreas,
  updateProfile,
} from '../api/conectraApi';
import StatCard from '../components/StatCard';
import { useAuth } from '../features/auth/useAuth';
import { updateUser } from '../api/usersApi';
import {
  formatDateTime,
  getAreaLabel,
  getEntityId,
  getRelationOne,
  getUserDisplayName,
  toNumber,
} from '../utils/strapi';

const FALLBACK_BADGES = [
  { title: 'Primeiro Post', subtitle: 'Criou Tópico' },
  { title: 'Partilha Ativa', subtitle: '10 materiais' },
  { title: 'Colaborador', subtitle: '5 grupos' },
  { title: 'Estrela', subtitle: '50 likes' },
  { title: 'Expert', subtitle: 'Nível 5' },
  { title: 'Mentor', subtitle: '20 ajudas' },
];

function toTrimmedOrNull(value) {
  const trimmed = String(value ?? '').trim();
  return trimmed ? trimmed : null;
}

function ProfilePage() {
  const { token, user, isAuthenticated } = useAuth();
  const [profiles, setProfiles] = useState([]);
  const [topics, setTopics] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [userAreas, setUserAreas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [accountForm, setAccountForm] = useState({ username: '', email: '' });
  const [profileForm, setProfileForm] = useState({ displayName: '', course: '', year: '', bio: '' });
  const [accountErrors, setAccountErrors] = useState({});
  const [profileErrors, setProfileErrors] = useState({});
  const [accountStatus, setAccountStatus] = useState({ isSubmitting: false, error: '', success: '' });
  const [profileStatus, setProfileStatus] = useState({ isSubmitting: false, error: '', success: '' });

  // 1. Função de carregamento isolada e segura
  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const [nextProfiles, nextTopics, nextMaterials, nextUserAreas] = await Promise.all([
        fetchProfiles(token),
        fetchTopics(token),
        fetchMaterials(token),
        fetchUserAreas(token),
      ]);

      setProfiles(nextProfiles ?? []);
      setTopics(nextTopics ?? []);
      setMaterials(nextMaterials ?? []);
      setUserAreas(nextUserAreas ?? []);
    } catch (requestError) {
      console.error('Erro ao carregar dados do perfil:', requestError);
      const message =
        requestError instanceof Error ? requestError.message : 'Não foi possível carregar os dados.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  // Dispara o carregamento apenas se estiver autenticado
  useEffect(() => {
    if (isAuthenticated && token) {
      void loadProfile();
    }
  }, [loadProfile, isAuthenticated, token]);

  // 2. Extração segura do ID do Utilizador Autenticado
  const loggedUserId = useMemo(() => {
    if (!user) return null;
    return user.id ?? user.documentId ?? user.attributes?.id ?? null;
  }, [user]);

  // 3. Descoberta do Perfil na lista (Memorizado com segurança)
  const profile = useMemo(() => {
    if (!loggedUserId || !Array.isArray(profiles)) return null;

    return profiles.find((entry) => {
      const relationUser = getRelationOne(entry, 'user');
      const relId = getEntityId(relationUser);
      return relId === loggedUserId;
    }) ?? null;
  }, [profiles, loggedUserId]);

  const profileUser = getRelationOne(profile, 'user');
  const managedUser = user ?? profileUser ?? null;
  const profileId = profile?.id ?? null;

  // 4. Sincronização controlada do formulário de Conta
  useEffect(() => {
    if (managedUser) {
      setAccountForm({
        username: managedUser.username ?? managedUser.attributes?.username ?? '',
        email: managedUser.email ?? managedUser.attributes?.email ?? '',
      });
    }
  }, [managedUser]);

  // 5. Sincronização controlada do formulário de Perfil
  useEffect(() => {
    if (profile) {
      setProfileForm({
        displayName: profile.displayName ?? '',
        course: profile.course ?? '',
        year: profile.year != null ? String(profile.year) : '',
        bio: profile.bio ?? '',
      });
    } else {
      setProfileForm({ displayName: '', course: '', year: '', bio: '' });
    }
  }, [profile]);

  // 6. Dados Computados protegidos contra dados em falta (Fallback total)
  const displayName = useMemo(() => {
    if (profile?.displayName) return profile.displayName;
    return getUserDisplayName(managedUser);
  }, [profile, managedUser]);

  const level = toNumber(profile?.level, 1);
  const points = toNumber(profile?.points, 0);

  const authoredTopics = useMemo(() => {
    if (!loggedUserId || !Array.isArray(topics)) return [];
    return topics.filter((topic) => {
      const topicUser = getRelationOne(topic, 'user');
      return getEntityId(topicUser) === loggedUserId;
    });
  }, [topics, loggedUserId]);

  const authoredMaterials = useMemo(() => {
    if (!loggedUserId || !Array.isArray(materials)) return [];
    return materials.filter((material) => {
      const matUser = getRelationOne(material, 'user');
      return getEntityId(matUser) === loggedUserId;
    });
  }, [materials, loggedUserId]);

  const interests = useMemo(() => {
    const listedInterests = Array.isArray(profile?.interests) ? profile.interests : [];
    if (listedInterests.length > 0) return listedInterests;

    if (!loggedUserId || !Array.isArray(userAreas)) return [];

    return userAreas
      .filter((entry) => getEntityId(getRelationOne(entry, 'user')) === loggedUserId)
      .map((entry) => getAreaLabel(getRelationOne(entry, 'area')))
      .filter(Boolean)
      .slice(0, 6);
  }, [loggedUserId, profile?.interests, userAreas]);

  const badges = useMemo(() => {
    return Array.isArray(profile?.badges) && profile.badges.length > 0
      ? profile.badges
      : FALLBACK_BADGES;
  }, [profile?.badges]);

  // 7. Manipuladores de Eventos (Handlers)
  const handleAccountChange = (field) => (event) => {
    setAccountForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleProfileChange = (field) => (event) => {
    setProfileForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const validateAccount = () => {
    const nextErrors = {};
    if (!accountForm.username.trim()) nextErrors.username = 'O nome de utilizador é obrigatório.';
    if (!accountForm.email.includes('@')) nextErrors.email = 'Insere um email válido.';
    return nextErrors;
  };

  const validateProfile = () => {
    const nextErrors = {};
    if (!profileForm.displayName.trim()) nextErrors.displayName = 'O nome de exibição é obrigatório.';
    if (profileForm.year.trim()) {
      const parsedYear = Number.parseInt(profileForm.year, 10);
      if (!Number.isInteger(parsedYear) || parsedYear < 1) {
        nextErrors.year = 'O ano deve ser um número inteiro maior ou igual a 1.';
      }
    }
    return nextErrors;
  };

  const handleAccountSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validateAccount();
    setAccountErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0 || !isAuthenticated || !loggedUserId) {
      return;
    }

    setAccountStatus({ isSubmitting: true, error: '', success: '' });

    try {
      const updated = await updateUser(
        loggedUserId,
        {
          username: accountForm.username.trim(),
          email: accountForm.email.trim(),
        },
        token,
      );

      setAccountStatus({
        isSubmitting: false,
        error: '',
        success: 'Dados de conta atualizados com sucesso.',
      });

      if (updated) {
        setAccountForm({
          username: updated.username ?? accountForm.username,
          email: updated.email ?? accountForm.email,
        });
      }
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : 'Não foi possível atualizar a conta.';
      setAccountStatus({ isSubmitting: false, error: message, success: '' });
    }
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validateProfile();
    setProfileErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    if (!isAuthenticated || !loggedUserId) {
      setProfileStatus({ isSubmitting: false, error: 'Sessão expirada ou utilizador não encontrado.', success: '' });
      return;
    }

    setProfileStatus({ isSubmitting: true, error: '', success: '' });

    const yearValue = profileForm.year.trim() ? Number.parseInt(profileForm.year.trim(), 10) : null;

    const profileAttributes = {
      displayName: profileForm.displayName.trim(),
      course: toTrimmedOrNull(profileForm.course),
      bio: toTrimmedOrNull(profileForm.bio),
      year: Number.isInteger(yearValue) ? yearValue : null,
    };

    try {
      if (profileId) {
        await updateProfile(profileId, profileAttributes, token);
      } else {
        const newProfilePayload = {
          ...profileAttributes,
          user: Number(loggedUserId),
          registrationDate: new Date().toISOString().split('T')[0],
          level: 1,
          points: 0,
        };
        await createProfile(newProfilePayload, token);
      }

      // Recarrega os dados do servidor para atualizar as relações de forma limpa
      await loadProfile();

      setProfileStatus({
        isSubmitting: false,
        error: '',
        success: profileId ? 'Perfil atualizado com sucesso.' : 'Perfil criado com sucesso.',
      });
    } catch (requestError) {
      console.error('ERRO COMPLETO DA REQUISIÇÃO:', requestError);
      const message = requestError instanceof Error ? requestError.message : 'Erro ao guardar dados do perfil.';
      setProfileStatus({ isSubmitting: false, error: message, success: '' });
    }
  };

  // 8. BARREIRAS DE SEGURANÇA (Evitam renderizar HTML com dados nulos enquanto carrega)
  if (!isAuthenticated) {
    return (
      <section className="page-section profile-page">
        <p className="status-message">Por favor, faz login para gerir as tuas informações.</p>
      </section>
    );
  }

  if (isLoading) {
    return (
      <section className="page-section profile-page">
        <p className="status-message">A carregar dados do perfil...</p>
      </section>
    );
  }

  return (
    <section className="page-section profile-page">
      <header className="hero-card profile-hero">
        <div>
          <h1>{displayName}</h1>
          <p>{profile?.course ?? 'Sem Curso Definido'}</p>
          <strong>Nível {level}</strong>
        </div>

        <div>
          <p>Registado em: {formatDateTime(profile?.registrationDate ?? profile?.createdAt)}</p>
          <p>{points} pontos</p>
        </div>
      </header>

      {error ? <p className="status-error">{error}</p> : null}

      <div className="stats-grid">
        <StatCard icon="T" value={authoredTopics.length} label="Tópicos" />
        <StatCard icon="M" value={authoredMaterials.length} label="Materiais" />
        <StatCard icon="P" value={points} label="Pontos" />
        <StatCard icon="S" value={interests.length} label="Especialidades" />
      </div>

      <div className="content-grid">
        <article className="content-panel">
          <h2>Gestão de Conta</h2>

          <form className="example-form" onSubmit={handleAccountSubmit} noValidate>
            <label className="form-field" htmlFor="profile-username">
              <span>Username</span>
              <input
                id="profile-username"
                type="text"
                value={accountForm.username}
                onChange={handleAccountChange('username')}
              />
              {accountErrors.username ? <p className="status-error">{accountErrors.username}</p> : null}
            </label>

            <label className="form-field" htmlFor="profile-email">
              <span>Email</span>
              <input
                id="profile-email"
                type="email"
                value={accountForm.email}
                onChange={handleAccountChange('email')}
              />
              {accountErrors.email ? <p className="status-error">{accountErrors.email}</p> : null}
            </label>

            <div className="inline-actions">
              <button type="submit" className="button button-primary" disabled={accountStatus.isSubmitting}>
                {accountStatus.isSubmitting ? 'A guardar conta...' : 'Guardar Conta'}
              </button>
            </div>
          </form>

          {accountStatus.error ? <p className="status-error">{accountStatus.error}</p> : null}
          {accountStatus.success ? <p className="status-success">{accountStatus.success}</p> : null}
        </article>

        <article className="content-panel">
          <h2>Gestão de Perfil</h2>

          <form className="example-form" onSubmit={handleProfileSubmit} noValidate>
            <label className="form-field" htmlFor="profile-display-name">
              <span>Nome de Exibição</span>
              <input
                id="profile-display-name"
                type="text"
                value={profileForm.displayName}
                onChange={handleProfileChange('displayName')}
              />
              {profileErrors.displayName ? <p className="status-error">{profileErrors.displayName}</p> : null}
            </label>

            <label className="form-field" htmlFor="profile-course">
              <span>Curso</span>
              <input
                id="profile-course"
                type="text"
                value={profileForm.course}
                onChange={handleProfileChange('course')}
              />
            </label>

            <label className="form-field" htmlFor="profile-year">
              <span>Ano Curricular</span>
              <input
                id="profile-year"
                type="number"
                min={1}
                value={profileForm.year}
                onChange={handleProfileChange('year')}
              />
              {profileErrors.year ? <p className="status-error">{profileErrors.year}</p> : null}
            </label>

            <label className="form-field" htmlFor="profile-bio">
              <span>Biografia</span>
              <textarea
                id="profile-bio"
                rows={4}
                value={profileForm.bio}
                onChange={handleProfileChange('bio')}
              />
            </label>

            <div className="inline-actions">
              <button type="submit" className="button button-primary" disabled={profileStatus.isSubmitting}>
                {profileStatus.isSubmitting ? 'A guardar perfil...' : 'Guardar Perfil'}
              </button>
            </div>
          </form>

          {profileStatus.error ? <p className="status-error">{profileStatus.error}</p> : null}
          {profileStatus.success ? <p className="status-success">{profileStatus.success}</p> : null}
        </article>
      </div>

      <article className="content-panel">
        <h2>Insígnias</h2>
        <ul className="badge-grid">
          {badges.map((badge, index) => (
            <li key={`${badge.title ?? badge.name}-${index}`}>
              <strong>{badge.title ?? badge.name}</strong>
              <small>{badge.subtitle ?? badge.description ?? 'Conquista'}</small>
            </li>
          ))}
        </ul>
      </article>

      <article className="content-panel">
        <h2>Especialidades</h2>
        {interests.length === 0 ? (
          <p className="status-message">Sem especialidades configuradas.</p>
        ) : (
          <div className="interest-grid">
            {interests.map((interest) => (
              <span key={interest}>{interest}</span>
            ))}
          </div>
        )}
      </article>
    </section>
  );
}

export default ProfilePage;