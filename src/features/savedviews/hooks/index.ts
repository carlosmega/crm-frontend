'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { savedviewsService } from '../api/savedviews-service'
import type {
  CreateSavedViewDto,
  UpdateSavedViewDto,
  ShareViewDto,
} from '@/core/contracts'

/**
 * Query key factory for saved views
 */
export const savedViewKeys = {
  all: ['savedviews'] as const,
  lists: () => [...savedViewKeys.all, 'list'] as const,
  list: (entitytype: string, viewtype?: number) =>
    [...savedViewKeys.lists(), entitytype, viewtype] as const,
  details: () => [...savedViewKeys.all, 'detail'] as const,
  detail: (id: string) => [...savedViewKeys.details(), id] as const,
  default: (entitytype: string) =>
    [...savedViewKeys.all, 'default', entitytype] as const,
}

/**
 * List saved views for an entity type
 */
export function useSavedViews(entitytype: string, viewtype?: number) {
  return useQuery({
    queryKey: savedViewKeys.list(entitytype, viewtype),
    queryFn: () => savedviewsService.list(entitytype, viewtype),
    enabled: !!entitytype,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  })
}

/**
 * Get a single saved view by ID
 */
export function useSavedView(id: string) {
  return useQuery({
    queryKey: savedViewKeys.detail(id),
    queryFn: () => savedviewsService.getById(id),
    enabled: !!id,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  })
}

/**
 * Get the default view for an entity type
 */
export function useDefaultView(entitytype: string) {
  return useQuery({
    queryKey: savedViewKeys.default(entitytype),
    queryFn: () => savedviewsService.getDefault(entitytype),
    enabled: !!entitytype,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

/**
 * Create a new saved view
 */
export function useCreateSavedView() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateSavedViewDto) => savedviewsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: savedViewKeys.all })
    },
  })
}

/**
 * Update an existing saved view
 */
export function useUpdateSavedView() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSavedViewDto }) =>
      savedviewsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: savedViewKeys.all })
    },
  })
}

/**
 * Delete a saved view
 */
export function useDeleteSavedView() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => savedviewsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: savedViewKeys.all })
    },
  })
}

/**
 * Set a view as the default for its entity type
 */
export function useSetDefaultView() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => savedviewsService.setDefault(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: savedViewKeys.all })
    },
  })
}

/**
 * Pin a view for quick access
 */
export function usePinView() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => savedviewsService.pin(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: savedViewKeys.all })
    },
  })
}

/**
 * Unpin a view
 */
export function useUnpinView() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => savedviewsService.unpin(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: savedViewKeys.all })
    },
  })
}

/**
 * Share a view with other users or teams
 */
export function useShareView() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ShareViewDto }) =>
      savedviewsService.share(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: savedViewKeys.all })
    },
  })
}
