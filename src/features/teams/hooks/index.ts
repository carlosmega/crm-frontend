'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { teamsService } from '../api/teams-service'
import type {
  CreateTeamDto,
  UpdateTeamDto,
  AddTeamMemberDto,
} from '@/core/contracts'

/**
 * Query key factory for teams
 */
export const teamKeys = {
  all: ['teams'] as const,
  lists: () => [...teamKeys.all, 'list'] as const,
  list: (params: Record<string, unknown>) =>
    [...teamKeys.lists(), params] as const,
  details: () => [...teamKeys.all, 'detail'] as const,
  detail: (id: string) => [...teamKeys.details(), id] as const,
  members: (teamId: string) =>
    [...teamKeys.all, 'members', teamId] as const,
  byUser: (userId: string) =>
    [...teamKeys.all, 'by-user', userId] as const,
}

/**
 * List teams with optional filters
 */
export function useTeams(params?: { teamtype?: number; search?: string }) {
  return useQuery({
    queryKey: teamKeys.list(params ?? {}),
    queryFn: () => teamsService.list(params),
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  })
}

/**
 * Get a single team by ID
 */
export function useTeam(id: string) {
  return useQuery({
    queryKey: teamKeys.detail(id),
    queryFn: () => teamsService.getById(id),
    enabled: !!id,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  })
}

/**
 * Get members of a team
 */
export function useTeamMembers(teamId: string) {
  return useQuery({
    queryKey: teamKeys.members(teamId),
    queryFn: () => teamsService.listMembers(teamId),
    enabled: !!teamId,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  })
}

/**
 * Get teams for a specific user
 */
export function useUserTeams(userId: string) {
  return useQuery({
    queryKey: teamKeys.byUser(userId),
    queryFn: () => teamsService.getByUser(userId),
    enabled: !!userId,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  })
}

/**
 * Create a new team
 */
export function useCreateTeam() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateTeamDto) => teamsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.all })
    },
  })
}

/**
 * Update an existing team
 */
export function useUpdateTeam() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTeamDto }) =>
      teamsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.all })
    },
  })
}

/**
 * Delete a team
 */
export function useDeleteTeam() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => teamsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.all })
    },
  })
}

/**
 * Add a member to a team
 */
export function useAddTeamMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      teamId,
      data,
    }: {
      teamId: string
      data: AddTeamMemberDto
    }) => teamsService.addMember(teamId, data),
    onSuccess: (_, { teamId }) => {
      queryClient.invalidateQueries({ queryKey: teamKeys.members(teamId) })
    },
  })
}

/**
 * Remove a member from a team
 */
export function useRemoveTeamMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      teamId,
      userId,
    }: {
      teamId: string
      userId: string
    }) => teamsService.removeMember(teamId, userId),
    onSuccess: (_, { teamId }) => {
      queryClient.invalidateQueries({ queryKey: teamKeys.members(teamId) })
    },
  })
}
