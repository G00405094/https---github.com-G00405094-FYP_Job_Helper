import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import styles from '../../styles/CVDetail.module.css';

export default function CVDetail() {
  const router = useRouter();
  const { id } = router.query;
  
  const [cv, setCv] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    async function fetchCV() {
      try {
        const response = await fetch(`/api/cvs?id=${id}`);
        const result = await response.json();

        if (response.ok) {
          setCv(result.data);
        } else {
          setError(result.error || 'Failed to fetch CV');
        }
      } catch (err) {
        setError('Error fetching CV data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchCV();
  }, [id]);

  if (!id) return null;
  if (loading) return <div className={styles.loading}>Loading CV...</div>;
  if (error) return <div className={styles.error}>Error: {error}</div>;
  if (!cv) return <div className={styles.notFound}>CV not found</div>;

  const handleDownload = () => {
    // Create a blob from the CV text
    const blob = new Blob([cv.generatedCV], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    // Create a link element and trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = `${cv.name.replace(/\s+/g, '_')}_CV.txt`;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>{cv.name}'s CV</h1>
        <button 
          onClick={handleDownload} 
          className={styles.downloadButton}
        >
          Download CV
        </button>
      </div>
      
      <div className={styles.cvContent}>
        <pre className={styles.generatedCV}>{cv.generatedCV}</pre>
      </div>
      
      <div className={styles.navigation}>
        <Link href="/cv-history">
          <a className={styles.backButton}>Back to CV History</a>
        </Link>
      </div>
    </div>
  );
} 