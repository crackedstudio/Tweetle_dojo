import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { TournamentListPage } from './pages/TournamentListPage';
import { TournamentGamePage } from './pages/TournamentGamePage';
import { AdminPage } from './pages/AdminPage';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<TournamentListPage />} />
        <Route path="/tournament/:id" element={<TournamentGamePage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </Layout>
  );
}
