import { AdminLayout } from '../../views/admin/AdminLayout';

export const metadata = { title: 'LINKIT 관리자' };

export default function Layout({ children }) {
  return <AdminLayout>{children}</AdminLayout>;
}
