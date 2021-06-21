import { CANCELED, FAILED, PENDING, RUNNING, SUCCESS } from 'dataTypes';
import Publication from './Publication';
import PublishingStatuses from './Status';

interface PublicationInfo {
  category: string;
  color: string;
}

const statusesMetadaData: Record<PublishingStatuses, PublicationInfo> = {
  PUBLISH_PENDING: { category: 'pending' , color: 'warning' },
  UNPUBLISH_PENDING: { category: 'pending', color: 'warning' },
  PUBLISH_CREATION_FAIL: { category: 'failed', color: 'danger' },
  PUBLISH_FAILED: { category: 'failed', color: 'danger' },
  UNPUBLISH_CREATION_FAIL: { category: 'failed', color: 'danger' },
  UNPUBLISH_FAILED: { category: 'failed', color: 'danger' },
  PIPELINE_MISSING: { category: 'failed', color: 'danger' },
  INCONSISTENT: { category: 'failed', color: 'info' },
  OUTDATED: { category: 'failed', color: 'info' },
  UNPUBLISHED: { category: 'finished', color: 'info' },
  OTHER: { category: 'finished', color: 'info' },
  PUBLISH_FINISHING: { category: 'running', color: 'info' },
  UNPUBLISH_FINISHING: { category: 'running', color: 'info' },
  REPUBLISH: { category: 'pending', color: 'info' },
  PUBLISHED: { category: 'finished', color: 'success' },
  PUBLISH_CREATED: { category: 'finished', color: 'success' },
  UNPUBLISH_CREATED: { category: 'finished', color: 'success' },
  PUBLISH_STARTING: { category: 'running', color: 'success' },
  PUBLISH_STARTED: { category: 'finished', color: 'success' },
  UNPUBLISH_STARTING: { category: 'running', color: 'success' },
  UNPUBLISH_STARTED: { category: 'finished', color: 'success' },
};

export const sortTypedPipelines = (pipes: Array<Publication>) => {
  
  return [
  {
    status: PENDING,
    items: pipes.filter((p) => statusesMetadaData[p.status as PublishingStatuses].category === PENDING),
  },
  {
    status: RUNNING,
    items: pipes.filter((p) => statusesMetadaData[p.status as PublishingStatuses].category === RUNNING),
  },
  {
    status: FAILED,
    items: pipes.filter((p) => statusesMetadaData[p.status as PublishingStatuses].category === FAILED),
  },
  {
    status: 'finished',
    items: pipes.filter(
      (p) => statusesMetadaData[p.status as PublishingStatuses].category === CANCELED
        || statusesMetadaData[p.status as PublishingStatuses].category === FAILED
        || statusesMetadaData[p.status as PublishingStatuses].category === 'finished'
    ),
  },
]};

export const getColorForStatus = (
  status: PublishingStatuses
) => statusesMetadaData[status].color;

export default statusesMetadaData;
