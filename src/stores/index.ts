import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { FeedbackItem, WorkOrder, EmergencyException, UserRole, MergeGroup } from '@/types'
import { feedbackData, workOrderData, emergencyData, roleOptions } from '@/api/mock-data'

export const useFeedbackStore = defineStore('feedback', () => {
  const items = ref<FeedbackItem[]>([...feedbackData])
  const activeTab = ref('all')
  const searchQuery = ref('')
  const selectedIds = ref<Set<string>>(new Set())
  const filterVisible = ref(false)

  const filters = ref<Record<string, string>>({
    source: '', mode: '', brand: '', site: '', productType: '',
    model: '', internal: '', feedbackUser: '', dateFrom: '', dateTo: '',
    processState: '', exception: '', returned: '', processRoute: '',
  })

  const tabCounts = computed(() => ({
    all: items.value.length,
    pending: items.value.filter(i => i.processState === '待处理').length,
    review: items.value.filter(i => i.processState === '待人工复核').length,
    done: items.value.filter(i => i.processState === '已处理').length,
    mine: items.value.filter(i => i.feedbackUser === currentUser.value.name).length,
  }))

  const mergeGroups = computed<MergeGroup[]>(() => {
    const groups: MergeGroup[] = []
    const seen = new Set<string>()

    items.value.forEach(item => {
      // P0/P1 不合并
      if (['P0', 'P1'].includes(item.exception)) {
        groups.push({ mergeGroup: '', lead: { data: item, confidence: 0.78 }, members: [{ data: item, confidence: 0.78 }], expanded: false })
        return
      }
      if (!item.mergeGroup) {
        groups.push({ mergeGroup: '', lead: { data: item, confidence: 0.78 }, members: [{ data: item, confidence: 0.78 }], expanded: false })
        return
      }
      if (seen.has(item.mergeGroup)) return
      seen.add(item.mergeGroup)
      const members = items.value.filter(i => i.mergeGroup === item.mergeGroup)
      if (members.length > 1) {
        groups.push({ mergeGroup: item.mergeGroup, lead: { data: item, confidence: 0.78 }, members: members.map(m => ({ data: m, confidence: 0.78 })), expanded: false })
      } else {
        groups.push({ mergeGroup: '', lead: { data: item, confidence: 0.78 }, members: [{ data: item, confidence: 0.78 }], expanded: false })
      }
    })
    return groups
  })

  const filteredGroups = computed(() => {
    let filtered = mergeGroups.value

    // Tab filter
    if (activeTab.value === 'pending') {
      filtered = filtered.filter(g => g.lead.data.processState === '待处理' || g.lead.data.processState === '待人工复核')
    } else if (activeTab.value === 'review') {
      filtered = filtered.filter(g => g.lead.data.processState === '待人工复核')
    } else if (activeTab.value === 'done') {
      filtered = filtered.filter(g => g.lead.data.processState === '已处理')
    } else if (activeTab.value === 'mine') {
      filtered = filtered.filter(g => g.lead.data.feedbackUser === currentUser.value.name)
    }

    // Search filter
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      filtered = filtered.filter(g =>
        g.members.some(m =>
          Object.values(m.data).join(' ').toLowerCase().includes(q)
        )
      )
    }

    // Column filters
    const f = filters.value
    if (f.source) filtered = filtered.filter(g => g.members.some(m => getDataSource(m.data) === f.source))
    if (f.mode) filtered = filtered.filter(g => g.members.some(m => m.data.createMode === f.mode))
    if (f.brand) filtered = filtered.filter(g => g.members.some(m => m.data.brand === f.brand))
    if (f.site) filtered = filtered.filter(g => g.members.some(m => m.data.site === f.site))
    if (f.productType) filtered = filtered.filter(g => g.members.some(m => m.data.productType === f.productType))
    if (f.model) filtered = filtered.filter(g => g.members.some(m => m.data.model === f.model))
    if (f.internal) filtered = filtered.filter(g => g.members.some(m => m.data.internal === f.internal))
    if (f.feedbackUser) filtered = filtered.filter(g => g.members.some(m => m.data.feedbackUser === f.feedbackUser))
    if (f.processState) filtered = filtered.filter(g => g.members.some(m => m.data.processState === f.processState))
    if (f.exception) filtered = filtered.filter(g => g.members.some(m => m.data.exception === f.exception))
    if (f.returned) filtered = filtered.filter(g => g.members.some(m => m.data.returned === f.returned))
    if (f.processRoute) filtered = filtered.filter(g => g.members.some(m => m.data.processRoute === f.processRoute))

    return filtered
  })

  function getDataSource(data: FeedbackItem): string {
    if (data.source === '退货原因') return data.site === 'Amazon.com (US)' ? '海外电商-退货反馈' : '国内电商-退货反馈'
    if (data.source === '商品评论') return data.site === 'Amazon.com (US)' ? '海外电商-商品评论' : '国内电商-商品评论'
    return data.source
  }

  function getDeviceType(data: FeedbackItem): string {
    return data.productType === '体脂秤' ? '八电极' : data.productType
  }

  function resetFilters() {
    Object.keys(filters.value).forEach(k => { filters.value[k] = '' })
    activeTab.value = 'all'
    searchQuery.value = ''
  }

  function updateItem(id: string, updates: Partial<FeedbackItem>) {
    const idx = items.value.findIndex(i => i.id === id)
    if (idx >= 0) items.value[idx] = { ...items.value[idx], ...updates }
  }

  return { items, activeTab, searchQuery, selectedIds, filterVisible, filters, tabCounts, mergeGroups, filteredGroups, getDataSource, getDeviceType, resetFilters, updateItem }
})

export const useWorkOrderStore = defineStore('workorder', () => {
  const orders = ref<WorkOrder[]>([...workOrderData])
  return { orders }
})

export const useEmergencyStore = defineStore('emergency', () => {
  const exceptions = ref<EmergencyException[]>([...emergencyData])

  function updateException(id: string, updates: Partial<EmergencyException>) {
    const idx = exceptions.value.findIndex(e => e.id === id)
    if (idx >= 0) exceptions.value[idx] = { ...exceptions.value[idx], ...updates }
  }

  return { exceptions, updateException }
})

export const useUserStore = defineStore('user', () => {
  const currentUser = ref<UserRole>(roleOptions[0])
  const users = ref<UserRole[]>([...roleOptions])

  function switchUser(key: string) {
    const found = roleOptions.find(r => r.key === key)
    if (found) currentUser.value = found
  }

  return { currentUser, users, switchUser }
})

// Shared currentUser ref for feedback store
export const currentUser = ref<UserRole>(roleOptions[0])
