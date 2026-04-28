import { Route, Routes } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import ChatbotPage from '../pages/ChatbotPage';
import DashboardPage from '../pages/DashboardPage';
import FormExamplesPage from '../pages/FormExamplesPage';
import ForumPage from '../pages/ForumPage';
import GroupChatPage from '../pages/GroupChatPage';
import GroupMembersPage from '../pages/GroupMembersPage';
import GroupsPage from '../pages/GroupsPage';
import LoginPage from '../pages/LoginPage';
import MaterialsPage from '../pages/MaterialsPage';
import NotFoundPage from '../pages/NotFoundPage';
import ProfilePage from '../pages/ProfilePage';
import TopicDetailPage from '../pages/TopicDetailPage';

function AppRouter() {
  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="/forum" element={<ForumPage />} />
        <Route path="/forum/topic/:topicId" element={<TopicDetailPage />} />
        <Route path="/materials" element={<MaterialsPage />} />
        <Route path="/groups" element={<GroupsPage />} />
        <Route path="/groups/:groupId/chat" element={<GroupChatPage />} />
        <Route path="/groups/:groupId/members" element={<GroupMembersPage />} />
        <Route path="/chatbot" element={<ChatbotPage />} />
        <Route path="/examples/forms" element={<FormExamplesPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      <Route path="/login" element={<LoginPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default AppRouter;
