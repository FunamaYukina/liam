import { PullRequestReviewWindow } from '@/components/PullRequestReviewWindow/PullRequestReviewWindow'
import styles from './page.module.css'

export default function ReviewPage() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Database Schema Review in Pull Request</h1>
      <PullRequestReviewWindow
        endpoint="api/review_in_pull_request"
        placeholder="https://github.com/..."
      />
    </div>
  )
}
