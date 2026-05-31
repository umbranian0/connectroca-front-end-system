import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import {
  fetchGroupMembers,
  fetchGroups,
  fetchAreas,
  joinGroup,
  createGroup,
} from '../api/conectraApi';

import { useAuth } from '../features/auth/useAuth';
import { useI18n } from '../features/i18n/useI18n';

import {
  getAreaLabel,
  getEntityId,
  getRelationOne,
  getUserDisplayName,
  toNumber,
} from '../utils/strapi';

function GroupsPage() {
  const { token, user } = useAuth();
  const { t } = useI18n();
  const [groups, setGroups] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [areas, setAreas] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // controla abertura do formulário
  const [showForm, setShowForm] = useState(false);

  // nome do grupo
  const [groupName, setGroupName] = useState('');

  // descrição do grupo
  const [groupDescription, setGroupDescription] = useState('');

  // área do grupo
  const [groupArea, setGroupArea] = useState('');

  // schedule do grupo
  const [groupSchedule, setGroupSchedule] = useState('');

  // location do grupo
  const [groupLocation, setGroupLocation] = useState('');

  // member limit do grupo
  const [groupMemberLimit, setGroupMemberLimit] = useState('30');

  const loadGroups = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {

      const [nextGroups, nextMemberships, nextAreas] = await Promise.all([
        fetchGroups(token),
        fetchGroupMembers(token),
        fetchAreas(token),
      ]);

      setGroups(nextGroups);
      setMemberships(nextMemberships);
      setAreas(nextAreas);

    } catch (requestError) {

      const message =
        requestError instanceof Error
          ? requestError.message
          : t('groups.loadError');

      setError(message);

    } finally {

      setIsLoading(false);

    }

  }, [t, token]);
  useEffect(() => {
    void loadGroups();
  }, [loadGroups]);

  // Limpar mensagem de sucesso após 5 segundos
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const handleJoinClick = async (groupId) => {
    setError('');
    setSuccess('');
    try {
      await joinGroup(
        token,
        Number(user.id),
        Number(groupId)
      );
      setSuccess('Boa! Agora fazes parte deste grupo.');
      loadGroups();
    } catch (err) {
      setError('Ops! Algo correu mal ao tentar entrar no grupo.');
    }
  };

  const criarGrupo = useCallback(async () => {
    if (!groupName.trim()) {
      setError('O grupo precisa de um nome');
      return;
    }

    if (!groupDescription.trim()) {
      setError('O grupo precisa de uma descrição');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const groupPayload = {
        name: groupName.trim(),
        description: groupDescription.trim(),
        memberLimit: Number(groupMemberLimit) || 30,
        schedule: groupSchedule.trim() || t('groups.scheduleTbd'),
        location: groupLocation.trim() || t('groups.locationTbd'),
        status: 'open',
        creator: Number(user.id),
      };

      // Adicionar área se selecionada
      if (groupArea) {
        groupPayload.area = Number(groupArea);
      }

      await createGroup(groupPayload, token);

      await loadGroups();
      setGroupName('');
      setGroupDescription('');
      setGroupArea('');
      setGroupSchedule('');
      setGroupLocation('');
      setGroupMemberLimit('30');
      setShowForm(false);
      setSuccess('Grupo criado com sucesso!');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao criar grupo';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [groupName, groupDescription, groupArea, groupSchedule, groupLocation, groupMemberLimit, token, t, user.id, loadGroups]);


  const groupMembersMap = useMemo(() => {

    const map = new Map();

    memberships.forEach((membership) => {

      const group =
        getRelationOne(membership, 'group');

      const groupId =
        String(getEntityId(group) ?? '');

      if (!groupId) return;

      const current =
        map.get(groupId) ?? [];

      current.push(membership);

      map.set(groupId, current);

    });

    return map;

  }, [memberships]);


  const memberGroupIds = useMemo(() => {

    const ids = new Set();

    memberships.forEach((membership) => {

      const membershipUser =
        getRelationOne(membership, 'user');

      const membershipGroup =
        getRelationOne(membership, 'group');

      if (membershipUser?.id === user?.id) {

        ids.add(
          String(getEntityId(membershipGroup) ?? '')
        );

      }

    });

    return ids;

  }, [memberships, user?.id]);

  // =========================
  // RENDER
  // =========================

  return (

    <section className="page-section groups-page">

      {/* =========================
          HEADER
         ========================= */}

      <header className="panel-title-row">

        <div>

          <h1>{t('groups.title')}</h1>

          <p>{t('groups.subtitle')}</p>

        </div>

        {/* botão abre formulário */}
        <button
          type="button"
          className="button button-primary"
          onClick={() => setShowForm(true)}
        >
          Novo + {t('groups.newGroup')}
        </button>
      </header>

      {

      }

      {showForm && (
        <div
          className="group-form"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            marginBottom: '20px',
          }}
        >
          {/* nome */}
          <input
            type="text"
            placeholder="Nome do grupo"
            value={groupName}
            onChange={(e) =>
              setGroupName(e.target.value)
            }
          />
          {/* descrição */}
          <textarea
            placeholder="Descrição do grupo"
            value={groupDescription}
            onChange={(e) =>
              setGroupDescription(e.target.value)
            }
          />
          {/* área */}
          <select
            value={groupArea}
            onChange={(e) =>
              setGroupArea(e.target.value)
            }
          >
            <option value="">Selecionar área (opcional)</option>
            {areas.map((area) => (
              <option
                key={getEntityId(area)}
                value={getEntityId(area)}
              >
                {getAreaLabel(area, t('format.generalArea'))}
              </option>
            ))}
          </select>
          {/* schedule */}
          <input
            type="text"
            placeholder="Horário (ex: Terças 19:00)"
            value={groupSchedule}
            onChange={(e) =>
              setGroupSchedule(e.target.value)
            }
          />
          {/* location */}
          <input
            type="text"
            placeholder="Localização"
            value={groupLocation}
            onChange={(e) =>
              setGroupLocation(e.target.value)
            }
          />
          {/* member limit */}
          <input
            type="number"
            placeholder="Limite de membros"
            min="1"
            value={groupMemberLimit}
            onChange={(e) =>
              setGroupMemberLimit(e.target.value)
            }
          />
          {/* criar grupo */}
          <button
            type="button"
            onClick={criarGrupo}
          >
            Criar Grupo
          </button>

        </div>

      )}

      {/* =========================
          LOADING
         ========================= */}

      {isLoading ? (
        <p className="status-message">
          {t('groups.loading')}
        </p>
      ) : null}

      {/* =========================
          ERROR
         ========================= */}

      {error ? (
        <p className="status-error">
          {error}
        </p>
      ) : null}

      {/* =========================
          SUCCESS
         ========================= */}

      {success ? (
        <p className="status-success">
          {success}
        </p>
      ) : null}

      {!isLoading && !error && groups.length > 0 ? (

        <ul className="group-card-list">

          {groups.map((group, index) => {

            const groupId =
              String(getEntityId(group) ?? group.id);

            const area =
              getRelationOne(group, 'area');

            const creator =
              getRelationOne(group, 'creator') || group.creator;

            const memberList =
              groupMembersMap.get(groupId) ?? [];

            const memberLimit =
              Math.max(
                toNumber(group.memberLimit, 30),
                1
              );

            const occupancy =
              Math.min(
                (memberList.length / memberLimit) * 100,
                100
              );

            const isMember =
              memberGroupIds.has(groupId);

            return (

              <li
                key={groupId}
                className="group-card"
                style={{ '--card-index': index }}
              >

                {/* =========================
                    BANNER
                   ========================= */}

                <div className="group-card-banner">

                  <strong>
                    {group.name ??
                      t('groups.unnamedGroup')}
                  </strong>

                  {/* botão entrar */}
                  <button
                    type="button"

                    disabled={isMember}

                    onClick={() =>
                      handleJoinClick(groupId)
                    }

                    style={{
                      cursor:
                        isMember
                          ? 'default'
                          : 'pointer',

                      backgroundColor:
                        isMember
                          ? 'rgba(255,255,255,0.3)'
                          : '#fff',

                      color:
                        isMember
                          ? '#fff'
                          : '#ff6b35',

                      border: 'none',

                      padding: '5px 12px',

                      borderRadius: '5px',

                      fontWeight: 'bold',

                      fontSize: '14px',
                    }}
                  >

                    {isMember
                      ? t('groups.alreadyMember')
                      : t('groups.joinGroup')}

                  </button>

                </div>

                {

                }

                <div className="group-card-body">

                  <p>
                    {group.description ??
                      t('groups.noDescription')}
                  </p>

                  <p>
                    {getAreaLabel(
                      area,
                      t('format.generalArea')
                    )}
                  </p>

                  <p>
                    {memberList.length}
                    /
                    {memberLimit}
                    {' '}
                    {t('groups.members')}
                  </p>

                  <p>
                    {group.schedule ??
                      t('groups.scheduleTbd')}
                  </p>

                  <p>
                    {group.location ??
                      t('groups.locationTbd')}
                  </p>

                  <p>
                    {getUserDisplayName(
                      creator,
                      t('format.communityMember')
                    )}
                  </p>

                  {/* progresso */}
                  <div className="group-progress-track">

                    <div
                      style={{
                        width: `${occupancy}%`,
                      }}
                    />

                  </div>

                  {/* ações */}
                  <div className="group-actions">

                    <Link
                      to={`/groups/${groupId}/chat`}
                      className="button button-secondary"
                    >
                      {t('groups.chat')}
                    </Link>

                    <Link
                      to={`/groups/${groupId}/members`}
                      className="button button-secondary"
                    >
                      {t('groups.membersPage')}
                    </Link>

                  </div>

                </div>

              </li>

            );

          })}

        </ul>

      ) : null}

    </section>

  );

}

export default GroupsPage;