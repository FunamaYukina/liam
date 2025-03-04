import Link from 'next/link'
import styles from './page.module.css'

export default function Page() {
  return (
    <div className={styles.main}>
      <Link href="/review">
        <button className={styles.button}>Go to Review</button>
      </Link>
      <Link href="/review_in_pull_request">
        <button className={styles.button}>Go to Review from PR</button>
      </Link>
    </div>
  )
}
