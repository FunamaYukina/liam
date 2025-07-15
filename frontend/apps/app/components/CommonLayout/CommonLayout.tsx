import type { ReactNode } from 'react'
import { getOrganizationId } from '@/features/organizations/services/getOrganizationId'
import { AppBar } from './AppBar/index.ts'
import styles from './CommonLayout.module.css'
import { GlobalNav } from './GlobalNav/index.ts'
import { OrgCookie } from './OrgCookie.tsx'
import { getAuthUser } from './services/getAuthUser.ts'
import { getOrganization } from './services/getOrganization.ts'
import { getOrganizationsByUserId } from './services/getOrganizationsByUserId.ts'

type CommonLayoutProps = {
  projectId?: string
  branchOrCommit?: string
  children: ReactNode
}

export async function CommonLayout({
  projectId,
  branchOrCommit,
  children,
}: CommonLayoutProps) {
  const organizationId = await getOrganizationId()
  const { data: organization } = await getOrganization(organizationId)

  const { data: authUser, error } = await getAuthUser()
  if (error) {
    throw new Error('Authentication failed')
  }

  const { data: organizations } = await getOrganizationsByUserId(
    authUser.user.id,
  )

  return (
    <div className={styles.layout}>
      {organization && <OrgCookie orgId={organization.id} />}
      <GlobalNav
        currentOrganization={organization}
        organizations={organizations}
      />
      <div className={styles.mainContent}>
        <AppBar
          currentProjectId={projectId}
          currentBranchOrCommit={branchOrCommit}
        />
        <main className={styles.content}>{children}</main>
      </div>
    </div>
  )
}
