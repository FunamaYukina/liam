import { ReviewWindow } from '@/components/ReviewWindow/ReviewWindow'
import styles from './page.module.css'

export default function ReviewPage() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Database Schema Review</h1>
      <ReviewWindow
        endpoint="api/review"
        placeholder="CREATE TABLE users (id INT PRIMARY KEY, name VARCHAR(255), ...);"
      />
    </div>
  )
}
