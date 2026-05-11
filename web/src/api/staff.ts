import request from './request'

export const getStaffList = () => request.get('/staff')
export const getNightTeam = () => request.get('/staff/night-team')
export const createStaff = (data: any) => request.post('/staff', data)
export const updateStaff = (id: number, data: any) => request.put(`/staff/${id}`, data)
export const deleteStaff = (id: number) => request.delete(`/staff/${id}`)
export const updateNightTeamOrder = (orders: any[]) => request.put('/staff/night-team/order', { orders })
