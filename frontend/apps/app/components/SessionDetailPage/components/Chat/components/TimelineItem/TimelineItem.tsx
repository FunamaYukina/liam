'use client'

import type { FC, PropsWithChildren } from 'react'
import { match } from 'ts-pattern'
import type { TimelineItemEntry } from '../../../../types'
import { AgentMessage } from './components/AgentMessage'
import { LogMessage } from './components/LogMessage'
import { UserMessage } from './components/UserMessage'
import { VersionMessage } from './components/VersionMessage'

type Props = PropsWithChildren & TimelineItemEntry

export const TimelineItem: FC<Props> = (props) => {
  return match(props)
    .with({ type: 'schema_version' }, ({ buildingSchemaVersionId }) => (
      <AgentMessage state="default">
        <VersionMessage buildingSchemaVersionId={buildingSchemaVersionId} />
      </AgentMessage>
    ))
    .with({ type: 'user' }, ({ content, timestamp }) => (
      <UserMessage content={content} timestamp={timestamp} />
    ))
    .with({ type: 'assistant_log' }, ({ content }) => (
      <AgentMessage state="default">
        <LogMessage content={content} />
      </AgentMessage>
    ))
    .otherwise(({ content, timestamp, children }) => (
      <AgentMessage
        state="default"
        message={content}
        time={timestamp.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })}
      >
        {children}
      </AgentMessage>
    ))
}
