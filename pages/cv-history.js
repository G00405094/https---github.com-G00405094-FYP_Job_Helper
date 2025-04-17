import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from '../styles/CVHistory.module.css';
import withAuth from '../lib/withAuth';
import { useAuth } from '../lib/AuthContext';

function CVHistory() {
  const [cvs, setCvs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    async function fetchCVs() {
      if (!isAuthenticated) {
        return; // Don't fetch if not authenticated
      }
      
      try {
        setLoading(true);
        const response = await fetch('/api/cvs');
        const result = await response.json();

        if (response.ok) {
          setCvs(result.data);
        } else {
          setError(result.error || 'Failed to fetch CVs');
        }
      } catch (err) {
        setError('Error fetching CV data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchCVs();
  }, [isAuthenticated]);

  if (loading) return <div className={styles.loading}>Loading CV history...</div>;
  if (error) return <div className={styles.error}>Error: {error}</div>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Your CV History</h1>
      
      {cvs.length === 0 ? (
        <p className={styles.noCvs}>You haven't created any CVs yet.</p>
      ) : (
        <div className={styles.cvGrid}>
          {cvs.map((cv) => (
            <div key={cv._id} className={styles.cvCard}>
              <h2 className={styles.cvName}>{cv.name}</h2>
              <p className={styles.cvDate}>
                Created: {new Date(cv.createdAt).toLocaleDateString()}
              </p>
              <Link href={`/cv/${cv._id}`}>
                <a className={styles.viewButton}>View CV</a>
              </Link>
            </div>
          ))}
        </div>
      )}
      
      <Link href="/">
        <a className={styles.createButton}>Create New CV</a>
      </Link>
    </div>
  );
}

// Export the component with authentication protection
export default withAuth(CVHistory); 