import request from './request'
import type { Shift } from '@/types'

export const getShifts = (params?: { category?: string; active?: boolean }) =>
  request.get('/shift', { params })

export const getShift = (id: number) => request.get(`/shift/${id}`)

export const createShift = (shift: Omit<Shift, 'id' | 'created_at' | 'updated_at'>) =>
  request.post('/shift', shift)

export const updateShift = (id: number, shift: Partial<Shift>) =>
  request.put(`/shift/${id}`, shift)

export const deleteShift = (id: number) => request.delete(`/shift/${id}`)
