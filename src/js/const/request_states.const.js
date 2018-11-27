export const REQUEST_STATES = Object.freeze({
  pending: 1,
  cancelled: 2,
  approved: 3,
  rejected: 4,
  permanentlyRejected: 5
})

export const REQUEST_STATES_STR = Object.freeze({
  pending: 'pending',
  cancelled: 'cancelled',
  approved: 'approved',
  rejected: 'rejected',
  permanentlyRejected: 'permanently_rejected'
})

export const REQUEST_STATES_VERBOSE = Object.freeze({
    [REQUEST_STATES_STR.pending]: 'pending',
    [REQUEST_STATES_STR.cancelled]: 'cancelled',
    [REQUEST_STATES_STR.approved]: 'approved',
    [REQUEST_STATES_STR.rejected]: 'rejected',
    [REQUEST_STATES_STR.permanentlyRejected]: 'permanently rejected'
})
