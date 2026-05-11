import request from './request'
import type { Staff } from '@/types'

export const getStaffList = () => request.get('/staff')
export const getNightTeam = () => request.get('/staff/night-team')
export const createStaff = (data: Partial<Staff>) => request.post('/staff', data)
export const updateStaff = (id: number, data: Partial<Staff>) => request.put(`/staff/${id}`, data)
export const deleteStaff = (id: number) => request.delete(`/staff/${id}`)
export const updateNightTeamOrder = (orders: Array<{ id: number; order: number }>) =>
  request.put('/staff/night-team/order', { orders })
