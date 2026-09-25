export const getStatusStyle = (status: string) => {
  switch (status) {
    case 'ACTIVE':
    case 'Active':
      return 'bg-primary/10 text-primary-fixed-variant border-primary/20';
    case 'INACTIVE':
    case 'Inactive':
      return 'bg-surface-container-high text-on-surface-variant border-outline-variant/30';
    case 'SUSPENDED':
    case 'Suspended':
      return 'bg-error/10 text-error border-error/20';
    default:
      return 'bg-surface-container-highest text-on-surface-variant border-transparent';
  }
};

export const getStatusDotStyle = (status: string) => {
  switch (status) {
    case 'ACTIVE':
    case 'Active':
      return 'bg-primary';
    case 'INACTIVE':
    case 'Inactive':
      return 'bg-on-surface-variant';
    case 'SUSPENDED':
    case 'Suspended':
      return 'bg-error';
    default:
      return 'bg-outline';
  }
};
