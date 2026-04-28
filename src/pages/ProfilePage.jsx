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

      setProfiles(nextProfiles);
      setTopics(nextTopics);
      setMaterials(nextMaterials);
      setUserAreas(nextUserAreas);
    } catch (requestError) {
      const message =
        requestError instanceof Error ? requestError.message : 'Unable to load profile data.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const profile = useMemo(() => {
    const byUser = profiles.find((entry) => {
      const relationUser = getRelationOne(entry, 'user');
      return relationUser?.id === user?.id;
    });

    return byUser ?? profiles[0] ?? null;
  }, [profiles, user?.id]);

  const profileUser = getRelationOne(profile, 'user');
  const managedUser = user ?? profileUser ?? null;
  const profileId = profile?.id ?? null;

  useEffect(() => {
    setAccountForm({
      username: managedUser?.username ?? '',
      email: managedUser?.email ?? '',
    });
  }, [managedUser?.id, managedUser?.username, managedUser?.email]);

  useEffect(() => {
    setProfileForm({
      displayName: profile?.displayName ?? '',
      course: profile?.course ?? '',
      year: profile?.year != null ? String(profile.year) : '',
      bio: profile?.bio ?? '',
    });
  }, [profile?.id, profile?.displayName, profile?.course, profile?.year, profile?.bio]);

  const displayName = profile?.displayName ?? getUserDisplayName(profileUser ?? managedUser);
  const level = toNumber(profile?.level, 5);
  const points = toNumber(profile?.points, 240);

  const authoredTopics = useMemo(() => {
    const authorId = profileUser?.id ?? managedUser?.id;
    return topics.filter((topic) => getRelationOne(topic, 'creator')?.id === authorId);
  }, [managedUser?.id, profileUser?.id, topics]);

  const authoredMaterials = useMemo(() => {
    const authorId = profileUser?.id ?? managedUser?.id;
    return materials.filter((material) => getRelationOne(material, 'author')?.id === authorId);
  }, [materials, managedUser?.id, profileUser?.id]);

  const interests = useMemo(() => {
    const listedInterests = Array.isArray(profile?.interests) ? profile.interests : [];

    if (listedInterests.length > 0) {
      return listedInterests;
    }

    return userAreas
      .filter((entry) => getRelationOne(entry, 'user')?.id === (profileUser?.id ?? managedUser?.id))
      .map((entry) => {
        const area = getRelationOne(entry, 'area');
        return getAreaLabel(area);
      })
      .filter(Boolean)
      .slice(0, 6);
  }, [managedUser?.id, profile?.interests, profileUser?.id, userAreas]);

  const badges =
    Array.isArray(profile?.badges) && profile.badges.length > 0 ? profile.badges : FALLBACK_BADGES;

  const handleAccountChange = (field) => (event) => {
    setAccountForm((current) => ({
      ...current,
      [field]: event.target.value,
    }));
  };

  const handleProfileChange = (field) => (event) => {
    setProfileForm((current) => ({
      ...current,
      [field]: event.target.value,
    }));
  };

  const validateAccount = () => {
    const nextErrors = {};

    if (!accountForm.username.trim()) {
      nextErrors.username = 'Username is required.';
    }

    if (!accountForm.email.includes('@')) {
      nextErrors.email = 'A valid email is required.';
    }

    return nextErrors;
  };

  const validateProfile = () => {
    const nextErrors = {};

    if (!profileForm.displayName.trim()) {
      nextErrors.displayName = 'Display name is required.';
    }

    if (profileForm.year.trim()) {
      const parsedYear = Number.parseInt(profileForm.year, 10);

      if (!Number.isInteger(parsedYear) || parsedYear < 1) {
        nextErrors.year = 'Year must be an integer >= 1.';
      }
    }

    return nextErrors;
  };

  const handleAccountSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = validateAccount();
    setAccountErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setAccountStatus((current) => ({ ...current, success: '' }));
      return;
    }

    if (!isAuthenticated || !managedUser?.id) {
      setAccountStatus({
        isSubmitting: false,
        error: 'Login is required to update account data.',
        success: '',
      });
      return;
    }

    setAccountStatus({ isSubmitting: true, error: '', success: '' });

    try {
      const updated = await updateUser(
        managedUser.id,
        {
          username: accountForm.username.trim(),
          email: accountForm.email.trim(),
        },
        token,
      );

      setAccountStatus({
        isSubmitting: false,
        error: '',
        success: 'Account data updated successfully.',
      });

      setAccountForm({
        username: updated?.username ?? accountForm.username,
        email: updated?.email ?? accountForm.email,
      });
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : 'Unable to update account.';
      setAccountStatus({ isSubmitting: false, error: message, success: '' });
    }
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = validateProfile();
    setProfileErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setProfileStatus((current) => ({ ...current, success: '' }));
      return;
    }

    if (!isAuthenticated || !managedUser?.id) {
      setProfileStatus({
        isSubmitting: false,
        error: 'Login is required to update profile data.',
        success: '',
      });
      return;
    }

    setProfileStatus({ isSubmitting: true, error: '', success: '' });

    const yearValue = profileForm.year.trim()
      ? Number.parseInt(profileForm.year.trim(), 10)
      : null;

    const payload = {
      displayName: profileForm.displayName.trim(),
      course: toTrimmedOrNull(profileForm.course),
      bio: toTrimmedOrNull(profileForm.bio),
      year: Number.isInteger(yearValue) ? yearValue : null,
    };

    try {
      if (profileId) {
        await updateProfile(profileId, payload, token);
      } else {
        await createProfile(
          {
            ...payload,
            user: managedUser.id,
          },
          token,
        );
      }

      setProfileStatus({
        isSubmitting: false,
        error: '',
        success: profileId
          ? 'Profile data updated successfully.'
          : 'Profile created successfully.',
      });

      await loadProfile();
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : 'Unable to update profile.';
      setProfileStatus({ isSubmitting: false, error: message, success: '' });
    }
  };

  return (
    <section className="page-section profile-page">
      <header className="hero-card profile-hero">
        <div>
          <h1>{displayName}</h1>
          <p>{profile?.course ?? 'Eng. Informática'}</p>
          <strong>Level {level}</strong>
        </div>

        <div>
          <p>Registered: {formatDateTime(profile?.registrationDate ?? profile?.createdAt)}</p>
          <p>{points} points</p>
        </div>
      </header>

      {!isAuthenticated ? (
        <p className="status-message">Login to manage your account and profile information.</p>
      ) : null}

      {isLoading ? <p className="status-message">Loading profile...</p> : null}
      {error ? <p className="status-error">{error}</p> : null}

      <div className="stats-grid">
        <StatCard icon="T" value={authoredTopics.length} label="Topics" />
        <StatCard icon="M" value={authoredMaterials.length} label="Materials" />
        <StatCard icon="P" value={points} label="Points" />
        <StatCard icon="S" value={interests.length} label="Specialties" />
      </div>

      <div className="content-grid">
        <article className="content-panel">
          <h2>Account Management</h2>

          <form className="example-form" onSubmit={handleAccountSubmit} noValidate>
            <label className="form-field" htmlFor="profile-username">
              <span>Username</span>
              <input
                id="profile-username"
                type="text"
                value={accountForm.username}
                onChange={handleAccountChange('username')}
              />
              {accountErrors.username ? <small className="form-error">{accountErrors.username}</small> : null}
            </label>

            <label className="form-field" htmlFor="profile-email">
              <span>Email</span>
              <input
                id="profile-email"
                type="email"
                value={accountForm.email}
                onChange={handleAccountChange('email')}
              />
              {accountErrors.email ? <small className="form-error">{accountErrors.email}</small> : null}
            </label>

            <div className="inline-actions">
              <button type="submit" className="button button-primary" disabled={accountStatus.isSubmitting || !isAuthenticated}>
                {accountStatus.isSubmitting ? 'Saving account...' : 'Save account'}
              </button>
            </div>
          </form>

          {accountStatus.error ? <p className="status-error">{accountStatus.error}</p> : null}
          {accountStatus.success ? <p className="status-success">{accountStatus.success}</p> : null}
        </article>

        <article className="content-panel">
          <h2>Profile Management</h2>

          <form className="example-form" onSubmit={handleProfileSubmit} noValidate>
            <label className="form-field" htmlFor="profile-display-name">
              <span>Display name</span>
              <input
                id="profile-display-name"
                type="text"
                value={profileForm.displayName}
                onChange={handleProfileChange('displayName')}
              />
              {profileErrors.displayName ? <small className="form-error">{profileErrors.displayName}</small> : null}
            </label>

            <label className="form-field" htmlFor="profile-course">
              <span>Course</span>
              <input
                id="profile-course"
                type="text"
                value={profileForm.course}
                onChange={handleProfileChange('course')}
              />
            </label>

            <label className="form-field" htmlFor="profile-year">
              <span>Year</span>
              <input
                id="profile-year"
                type="number"
                min={1}
                value={profileForm.year}
                onChange={handleProfileChange('year')}
              />
              {profileErrors.year ? <small className="form-error">{profileErrors.year}</small> : null}
            </label>

            <label className="form-field" htmlFor="profile-bio">
              <span>Bio</span>
              <textarea
                id="profile-bio"
                rows={4}
                value={profileForm.bio}
                onChange={handleProfileChange('bio')}
              />
            </label>

            <div className="inline-actions">
              <button type="submit" className="button button-primary" disabled={profileStatus.isSubmitting || !isAuthenticated}>
                {profileStatus.isSubmitting ? 'Saving profile...' : 'Save profile'}
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
