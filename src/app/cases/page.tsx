"use client";
import React, { Suspense, useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Search, Filter, LayoutGrid, List as ListIcon, Menu, Table as TableIcon,
  Video, CheckCircle2, AlertCircle, ArrowUpRight, RotateCcw, ChevronDown,
  Tag, Radio, ShieldAlert, Building2, Flame, FolderOpen, MessageSquare,
  Layers, CheckSquare, Sparkles, PlusCircle, Check, X, AlertTriangle, Link as LinkIcon,
  Calendar, Heart, Eye, Share2, RefreshCw, Bot, Zap, Users, ExternalLink, Info
} from 'lucide-react';
import { API, type InstagramConnectionStatus, type MonitoredPostSummary, type ConsolidatedCaseSummary, type ConversationAnalysis } from '@/lib/api/client';
import { CommentAuthor } from '@/components/ui/CommentAuthor';
import { ConversationBadge } from '@/components/ui/ConversationBadge';
import CommentReviewQueue from '@/components/cases/CommentReviewQueue';
import TriageReviewModal, { type ReviewComment } from '@/components/cases/TriageReviewModal';
import { CaseProvenanceNote } from '@/components/cases/CaseProvenanceNote';
import { CaseCover } from '@/components/cases/CaseCover';
import { MonitoredPostCard } from '@/components/cases/MonitoredPostCard';
import { formatNumber } from '@/lib/utils';
import styles from './cases.module.scss';

export interface RawCommentItem {
  id: string;
  post_id: string;
  comment_id: string;
  post_url?: string | null;
  comment_url?: string | null;
  author_picture_url?: string | null;
  author_is_protected?: boolean;
  source: 'Facebook' | 'Instagram';
  author: string;
  postTitle: string;
  content: string;
  detectedIntent: string;
  detectedLocation: string;
  referenceStreet: string;
  detectedCategory: string;
  detectedTopic: string;
  detectedProblem: string;
  aiConfidence: number | null;
  requiresFollowup: boolean;
  possibleCaseMatch: string | null;
  caseMatchTitle?: string;
  similarityPercent?: number;
  metaDirectContactAllowed: boolean;
  dateTime: string;
}


function getEmotionConfig(sentiment?: string) {
  if (!sentiment) {
    return {
      primary: 'Paz o tranquilidad',
      sub: 'Serenidad',
      emoji: '🕊️',
      color: '#06b6d4',
      bg: 'rgba(6, 182, 212, 0.15)',
      border: 'rgba(6, 182, 212, 0.35)',
      full: 'Paz o tranquilidad: Serenidad'
    };
  }

  const parts = sentiment.split(':');
  const primaryRaw = (parts[0] || '').trim();
  const subRaw = (parts[1] || '').trim();
  const low = primaryRaw.toLowerCase();

  if (low.includes('enojo') || low.includes('ira') || low.includes('indignación') || low.includes('crítico') || low.includes('critico') || low.includes('ataque')) {
    return {
      primary: 'Enojo o ira',
      sub: subRaw || 'Frustración',
      emoji: '😡',
      color: '#ef4444',
      bg: 'rgba(239, 68, 68, 0.15)',
      border: 'rgba(239, 68, 68, 0.35)',
      full: sentiment.includes(':') ? sentiment : `Enojo o ira: ${subRaw || 'Frustración'}`
    };
  }
  if (low.includes('miedo') || low.includes('preocupado') || low.includes('insegur')) {
    return {
      primary: 'Miedo',
      sub: subRaw || 'Inseguridad',
      emoji: '😨',
      color: '#f59e0b',
      bg: 'rgba(245, 158, 11, 0.15)',
      border: 'rgba(245, 158, 11, 0.35)',
      full: sentiment.includes(':') ? sentiment : `Miedo: ${subRaw || 'Inseguridad'}`
    };
  }
  if (low.includes('tristeza') || low.includes('desánimo') || low.includes('desanimo') || low.includes('pesar')) {
    return {
      primary: 'Tristeza',
      sub: subRaw || 'Desánimo',
      emoji: '😢',
      color: '#818cf8',
      bg: 'rgba(99, 102, 241, 0.15)',
      border: 'rgba(99, 102, 241, 0.35)',
      full: sentiment.includes(':') ? sentiment : `Tristeza: ${subRaw || 'Desánimo'}`
    };
  }
  if (low.includes('alegría') || low.includes('alegria') || low.includes('positivo') || low.includes('aprobación')) {
    return {
      primary: 'Alegría',
      sub: subRaw || 'Entusiasmo',
      emoji: '😊',
      color: '#10b981',
      bg: 'rgba(16, 185, 129, 0.15)',
      border: 'rgba(16, 185, 129, 0.35)',
      full: sentiment.includes(':') ? sentiment : `Alegría: ${subRaw || 'Entusiasmo'}`
    };
  }
  if (low.includes('poder') || low.includes('fortaleza')) {
    return {
      primary: 'Poder o fortaleza',
      sub: subRaw || 'Confianza',
      emoji: '💪',
      color: '#a855f7',
      bg: 'rgba(168, 85, 247, 0.15)',
      border: 'rgba(168, 85, 247, 0.35)',
      full: sentiment.includes(':') ? sentiment : `Poder o fortaleza: ${subRaw || 'Confianza'}`
    };
  }
  return {
    primary: 'Paz o tranquilidad',
    sub: subRaw || 'Serenidad',
    emoji: '🕊️',
    color: '#06b6d4',
    bg: 'rgba(6, 182, 212, 0.15)',
    border: 'rgba(6, 182, 212, 0.35)',
    full: sentiment.includes(':') ? sentiment : `Paz o tranquilidad: ${subRaw || 'Serenidad'}`
  };
}

const INITIAL_RAW_COMMENTS: RawCommentItem[] = [];

const NEIVA_ENTITIES = [
  'Las Ceibas - Empresas Públicas de Neiva E.S.P.',
  'Secretaría de Infraestructura y Vías',
  'Secretaría de Movilidad y Tránsito',
  'Secretaría de Salud Municipal',
  'Secretaría de Medio Ambiente y Desarrollo Rural',
  'Secretaría de Gobierno y Convivencia Ciudadana',
];

type CaseCard = ReturnType<typeof formatCaseSummary>;
interface LinkedCase { id:string; author:string; content:string; priority:string; status:string; category:string; sentiment:string; location:string; date_time:string; assigned_department?:string; comment_id?:string; author_picture_url?:string; author_is_protected?:boolean; comment_permalink_url?:string }
interface CapturedComment { followers_count?:number|null; following_count?:number|null; account_age?:string; id:string; message?:string; content?:string; author?:string; time?:string; published_at?:string; case_id?:string; is_bot?:boolean; source?:string; author_picture_url?:string; author_is_protected?:boolean; permalink_url?:string; conversation_analysis?:ConversationAnalysis }
interface PostDetail extends MonitoredPostSummary { raw_comments?:CapturedComment[]; cases?:LinkedCase[]; conversation_analysis?:Record<string,ConversationAnalysis> }
const INITIAL_CASES: CaseCard[] = [];
const POST_PAGE_SIZE = 24;
const CASE_PAGE_SIZE = 24;
function formatCaseSummary(item: ConsolidatedCaseSummary) {
  return { ...item, dateTime: item.date_time, mediaType: item.media_type || 'none', imageUrl: item.image_url, thumbnailUrl: item.thumbnail_url };
}

function CasesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const view = searchParams.get('view');
  const activeTab = view === 'posts' ? 'POSTS' : view === 'review' ? 'COMMENTS' : 'CASES';
  const setActiveTab = (tab: 'POSTS' | 'CASES' | 'COMMENTS') => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('view', tab === 'CASES' ? 'cases' : tab === 'COMMENTS' ? 'review' : 'posts');
    router.replace(`/cases?${params}`, { scroll: false });
  };
  const [postsList, setPostsList] = useState<MonitoredPostSummary[]>([]);
  const [selectedPostSnapshot, setSelectedPost] = useState<PostDetail | null>(null);
  const selectedPost = selectedPostSnapshot;
  const [loadingPostDetails, setLoadingPostDetails] = useState(false);
  const [postDetailsError, setPostDetailsError] = useState<string | null>(null);
  const [visibleCommentCount, setVisibleCommentCount] = useState(50);
  const [visibleCaseCount, setVisibleCaseCount] = useState(20);
  const postDetailsAbort = useRef<AbortController | null>(null);
  const [postDrawerTab, setPostDrawerTab] = useState<'CASES' | 'RAW_COMMENTS'>('CASES');
  const [drawerCommentFilter, setDrawerCommentFilter] = useState<'all' | 'cases_only' | 'general_only' | 'positive_only' | 'critics_only' | 'bots_only'>('all');
  const [loadingPosts, setLoadingPosts] = useState<boolean>(true);
  const [monthsList, setMonthsList] = useState<{ key: string; label: string; count: number }[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [postSearch, setPostSearch] = useState<string>('');
  const [postNetworkFilter, setPostNetworkFilter] = useState<'all' | 'Facebook' | 'Instagram'>('all');
  const [postFilterCasesOnly, setPostFilterCasesOnly] = useState<boolean>(false);
  const [postsTotal, setPostsTotal] = useState(0);
  const [casesTotal, setCasesTotal] = useState(0);
  const [postsHasMore, setPostsHasMore] = useState(false);
  const [postsError, setPostsError] = useState<string | null>(null);
  const [instagramConnection, setInstagramConnection] = useState<InstagramConnectionStatus | null>(null);
  const postsRequest = useRef(0);
  const loadedPostsCount = useRef(POST_PAGE_SIZE);
  const postsAbort = useRef<AbortController | null>(null);
  const loadedPostFilters = useRef('');
  const invalidatePostsRequests = React.useCallback(() => {
    ++postsRequest.current;
    postsAbort.current?.abort();
  }, []);

  const loadPosts = React.useCallback(async (offset = 0, limit = POST_PAGE_SIZE, silent = false) => {
    const request = ++postsRequest.current;
    postsAbort.current?.abort();
    const controller = new AbortController();
    postsAbort.current = controller;
    if (!silent) setLoadingPosts(true);
    setPostsError(null);
    try {
      let page = await API.meta.getPostsPage(Math.min(2000, limit), offset, selectedMonth, postSearch, postNetworkFilter, { signal: controller.signal }, postFilterCasesOnly);
      const items = [...page.items];
      while (request === postsRequest.current && offset === 0 && items.length < limit && page.has_more && page.items.length > 0) {
        page = await API.meta.getPostsPage(Math.min(2000, limit - items.length), items.length, selectedMonth, postSearch, postNetworkFilter, { signal: controller.signal }, postFilterCasesOnly);
        items.push(...page.items);
      }
      if (request !== postsRequest.current) return;
      setPostsList(current => {
        const previous = new Map(current.map(post => [post.id, post]));
        const unchanged = (post: MonitoredPostSummary) => {
          const old = previous.get(post.id);
          return old && (Object.keys(post) as (keyof MonitoredPostSummary)[]).every(key => old[key] === post[key]) ? old : post;
        };
        return offset === 0 ? items.map(unchanged) : [...current, ...items.filter(post => !previous.has(post.id))];
      });
      loadedPostsCount.current = offset + items.length;
      setPostsTotal(page.total);
      setCasesTotal(page.cases_total);
      setPostsHasMore(page.has_more);
    } catch (error) {
      if (request === postsRequest.current && !controller.signal.aborted) {
        setPostsError(error instanceof Error ? error.message : 'No se pudieron cargar las publicaciones');
      }
    } finally {
      if (request === postsRequest.current) setLoadingPosts(false);
    }
  }, [selectedMonth, postSearch, postNetworkFilter, postFilterCasesOnly]);

  const openPost = React.useCallback(async (post: MonitoredPostSummary) => {
    postDetailsAbort.current?.abort();
    const controller = new AbortController();
    postDetailsAbort.current = controller;
    setSelectedPost(post);
    setPostDrawerTab(post.cases_count > 0 ? 'CASES' : 'RAW_COMMENTS');
    setVisibleCommentCount(50);
    setVisibleCaseCount(20);
    setDrawerCommentFilter('all');
    setPostDetailsError(null);
    setLoadingPostDetails(true);
    try {
      const detail = await API.meta.getPost(post.id, { signal: controller.signal });
      if (!controller.signal.aborted) setSelectedPost(detail);
    } catch (error) {
      if (!controller.signal.aborted) setPostDetailsError(error instanceof Error ? error.message : 'No se pudo cargar la publicación');
    } finally {
      if (postDetailsAbort.current === controller) setLoadingPostDetails(false);
    }
  }, []);

  const abortPostDetails = React.useCallback(() => { postDetailsAbort.current?.abort(); }, []);
  useEffect(() => abortPostDetails, [abortPostDetails]);

  const closePost = React.useCallback(() => {
    postDetailsAbort.current?.abort();
    postDetailsAbort.current = null;
    setSelectedPost(null);
    setLoadingPostDetails(false);
  }, []);

  const latestPostsLoader = useRef(loadPosts);
  useEffect(() => { latestPostsLoader.current = loadPosts; }, [loadPosts]);
  const [rawComments, setRawComments] = useState<RawCommentItem[]>([]);
  const [selectedCommentIds, setSelectedCommentIds] = useState<string[]>([]);
  const [reviewComments, setReviewComments] = useState<ReviewComment[] | null>(null);
  const [reviewMode, setReviewMode] = useState<'create' | 'associate'>('create');
  const [triageLoading, setTriageLoading] = useState(false);
  const [savedCaseId, setSavedCaseId] = useState<string | null>(null);
  const triageRequest = useRef(0);
  const [reviewTarget, setReviewTarget] = useState<string | undefined>();
  const [triageError, setTriageError] = useState<string | null>(null);
  const [groupSuccessMsg, setGroupSuccessMsg] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'card' | 'compact' | 'list' | 'table'>(() => { const value = searchParams.get('layout'); return value === 'card' || value === 'compact' || value === 'table' ? value : 'list'; });
  const [search, setSearch] = useState(() => searchParams.get('search') || '');
  const [filterPriority, setFilterPriority] = useState<string>(() => searchParams.get('priority') || 'all');
  const [filterCategory, setFilterCategory] = useState<string>(() => searchParams.get('category') || 'all');
  const [filterSource, setFilterSource] = useState<string>(() => searchParams.get('source') || 'all');
  const [filterProvenance, setFilterProvenance] = useState<'all' | 'needs_review' | 'recovered_local'>(() => { const value = searchParams.get('provenance'); return value === 'needs_review' || value === 'recovered_local' ? value : 'all'; });
  const [filterStatus, setFilterStatus] = useState<string>(() => searchParams.get('status') || 'all');
  const [includeDuplicates, setIncludeDuplicates] = useState(() => searchParams.get('include_duplicates') === 'true');
  const [filterDepartment, setFilterDepartment] = useState<string>(() => searchParams.get('department') || 'all');
  const [filterPriorityOnly, setFilterPriorityOnly] = useState<boolean>(() => searchParams.get('priority_only') === 'true');
  const [casesList, setCasesList] = useState<CaseCard[]>(INITIAL_CASES);
  const [caseOffset, setCaseOffset] = useState(() => { const value = Number(searchParams.get('skip') || 0); return Number.isSafeInteger(value) && value >= 0 ? value : 0; });
  const [matchedCasesTotal, setMatchedCasesTotal] = useState(0);
  const [casesLoading, setCasesLoading] = useState(false);
  const [casesError, setCasesError] = useState<string | null>(null);
  const casesRequest = useRef(0);
  const casesAbort = useRef<AbortController | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);
  const [lastAutoSync, setLastAutoSync] = useState<string>('En tiempo real');
  const [autoPilotActive, setAutoPilotActive] = useState<boolean>(true);
  const [activeSmartReplyCommentId, setActiveSmartReplyCommentId] = useState<string | null>(null);
  const [smartReplyResult, setSmartReplyResult] = useState<{ text: string; topic: string } | null>(null);
  const [smartReplyError, setSmartReplyError] = useState('');
  const [smartReplyLoading, setSmartReplyLoading] = useState<boolean>(false);
  const [smartReplyCopied, setSmartReplyCopied] = useState<boolean>(false);

  const handleGenerateCommentReply = async (comment: CapturedComment) => {
    setActiveSmartReplyCommentId(comment.id || comment.message || '');
    setSmartReplyLoading(true);
    setSmartReplyCopied(false);
    try {
      setSmartReplyError('');
      setSmartReplyResult(null);
      const data = await API.ai.generateReply({ comment_text: comment.message || comment.content || '', user_type: 'Sin clasificar' });
      setSmartReplyResult({ text: data.response_text, topic: data.topic });
    } catch (error) {
      setSmartReplyError(error instanceof Error ? error.message : 'No se pudo preparar el borrador.');
    } finally {
      setSmartReplyLoading(false);
    }
  };

  const handleSyncLive = async () => {
    setIsSyncing(true);
    setSyncFeedback('Iniciando captura en segundo plano. Puedes seguir consultando la información guardada.');
    try {
      const syncRes = await API.meta.syncLive(job => setSyncFeedback(job.progress.detail || 'Actualización en segundo plano…'));
      const [, , triageRes] = await Promise.allSettled([
        latestPostsLoader.current(),
        activeTab === 'CASES' ? refreshCases() : Promise.resolve(null),
        activeTab === 'COMMENTS' ? API.meta.getTriageComments() : Promise.resolve(null),
      ]);

      if (triageRes.status === 'fulfilled' && Array.isArray(triageRes.value)) {
        setRawComments(triageRes.value);
        if (triageRes.value.length >= 2) {
          const first = triageRes.value[0];
          setSelectedCommentIds([first.id]);
        }
      }

      setSyncFeedback(
        `${syncRes.status === 'partial' ? '⚠️ Sincronización parcial' : '✅ Sincronización completada'} (${syncRes.timestamp || 'Ahora'}): ` +
        `${syncRes.posts_updated ?? 0} publicaciones actualizadas y ${syncRes.new_comments_captured ?? 0} comentarios nuevos capturados.` +
        (syncRes.instagram_status && syncRes.instagram_status !== 'success' ? ` Instagram: ${syncRes.instagram_detail || 'Revisa el estado de la conexión.'}` : '')
      );
      setTimeout(() => {
        setSyncFeedback(null);
      }, 5500);
    } catch (err) {
      console.error('Error sincronizando con Meta:', err);
      setSyncFeedback(err instanceof Error ? err.message : 'No se pudo completar la actualización. Los datos anteriores siguen disponibles.');
      setTimeout(() => {
        setSyncFeedback(null);
      }, 4000);
    } finally {
      setIsSyncing(false);
    }
  };

  const reviewSelection = (ids: string[], mode: 'create' | 'associate') => {
    const selection = rawComments.filter(comment => ids.includes(comment.id));
    if (!selection.length) return;
    setReviewMode(mode); setReviewTarget(undefined); setReviewComments(selection);
  };

  const refreshCases = React.useCallback(async (silent = false) => {
    const request = ++casesRequest.current;
    casesAbort.current?.abort();
    const controller = new AbortController();
    casesAbort.current = controller;
    if (!silent) setCasesLoading(true);
    setCasesError(null);
    try {
      const params = new URLSearchParams({limit: String(CASE_PAGE_SIZE), skip: String(caseOffset), search,
        priority: filterPriority, category: filterCategory, source: filterSource, status: filterStatus,
        department: filterDepartment, provenance: filterProvenance, include_duplicates: String(includeDuplicates), priority_only: String(filterPriorityOnly)});
      const page = await API.cases.getPage(params, { signal: controller.signal });
      if (request !== casesRequest.current || controller.signal.aborted) return;
      setCasesList(current => {
        const old = new Map(current.map(item => [item.id, item]));
        return page.items.map(item => {
          const formatted = formatCaseSummary(item);
          const previous = old.get(item.id);
          return previous && Object.keys(formatted).every(key => previous[key as keyof typeof formatted] === formatted[key as keyof typeof formatted]) ? previous : formatted;
        });
      });
      setMatchedCasesTotal(page.total);
      if (!search.trim() && [filterPriority, filterCategory, filterSource, filterStatus, filterDepartment, filterProvenance].every(value => value === 'all') && !filterPriorityOnly && !includeDuplicates) setCasesTotal(page.total);
    } catch (error) {
      if (request === casesRequest.current && !controller.signal.aborted) setCasesError(error instanceof Error ? error.message : 'No se pudieron cargar los casos');
    } finally {
      if (request === casesRequest.current && !controller.signal.aborted) setCasesLoading(false);
    }
  }, [caseOffset, search, filterPriority, filterCategory, filterSource, filterStatus, filterDepartment, filterPriorityOnly, filterProvenance, includeDuplicates]);

  const filterIdentity = JSON.stringify([search, filterPriority, filterCategory, filterSource, filterStatus, filterDepartment, filterPriorityOnly, filterProvenance, includeDuplicates]);
  const previousFilterIdentity = useRef(filterIdentity);
  useEffect(() => { if (previousFilterIdentity.current !== filterIdentity) { previousFilterIdentity.current = filterIdentity; setCaseOffset(0); } }, [filterIdentity]);
  useEffect(() => {
    if (activeTab !== 'CASES') return;
    const timer = setTimeout(() => refreshCases(), search ? 250 : 0);
    const poll = setInterval(() => { if (document.visibilityState === 'visible') refreshCases(true); }, 45000);
    const visible = () => { if (document.visibilityState === 'visible') refreshCases(true); };
    document.addEventListener('visibilitychange', visible);
    return () => { clearTimeout(timer); clearInterval(poll); document.removeEventListener('visibilitychange', visible); ++casesRequest.current; casesAbort.current?.abort(); };
  }, [activeTab, refreshCases, search]);

  const refreshMetadata = React.useCallback(async () => {
    const [months, instagram] = await Promise.allSettled([API.meta.getMonths(), API.meta.getInstagramStatus()]);
    if (months.status === 'fulfilled' && Array.isArray(months.value)) setMonthsList(months.value);
    if (instagram.status === 'fulfilled') setInstagramConnection(instagram.value);
    else setInstagramConnection({
      status: 'error', username: null, account_id: null, detail: 'No fue posible verificar Instagram.',
      required_permissions: [], missing_permissions: [], permissions_checked: false, comments_available: false,
    });
  }, []);

  const refreshTriage = React.useCallback(async () => {
    const request = ++triageRequest.current;
    setTriageLoading(true);
    try {
      const comments = await API.meta.getTriageComments();
      if (request !== triageRequest.current) return;
      if (Array.isArray(comments)) { setRawComments(comments); setTriageError(null); setSelectedCommentIds(ids => ids.filter(id => comments.some((c: RawCommentItem) => c.id === id))); }
    } catch (error) {
      if (request === triageRequest.current) setTriageError(error instanceof Error ? error.message : 'No se pudieron cargar los comentarios');
    } finally {
      if (request === triageRequest.current) setTriageLoading(false);
    }
  }, []);

  useEffect(() => {
    // Consultar el estado externo cuando el navegador haya atendido la carga principal.
    if ('requestIdleCallback' in window) {
      const idle = window.requestIdleCallback(() => refreshMetadata(), { timeout: 1000 });
      return () => window.cancelIdleCallback(idle);
    }
    const timer = setTimeout(() => refreshMetadata(), 0);
    return () => clearTimeout(timer);
  }, [refreshMetadata]);

  useEffect(() => {
    if (activeTab !== 'POSTS') return;
    const filterKey = JSON.stringify([selectedMonth, postSearch, postNetworkFilter, postFilterCasesOnly]);
    invalidatePostsRequests();
    const initialLoad = setTimeout(() => {
      if (loadedPostFilters.current !== filterKey) {
        loadedPostFilters.current = filterKey;
        loadedPostsCount.current = POST_PAGE_SIZE;
        setPostsList([]);
        setPostsTotal(0);
        setPostsHasMore(false);
      }
      loadPosts(0, Math.max(POST_PAGE_SIZE, loadedPostsCount.current));
    }, postSearch ? 250 : 0);
    const refreshVisible = () => {
      if (document.visibilityState !== 'visible') return;
      loadPosts(0, Math.max(POST_PAGE_SIZE, loadedPostsCount.current), true);
      refreshMetadata();
      setLastAutoSync(new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    const poll = setInterval(refreshVisible, 45000);
    document.addEventListener('visibilitychange', refreshVisible);
    return () => {
      clearTimeout(initialLoad);
      clearInterval(poll);
      invalidatePostsRequests();
      document.removeEventListener('visibilitychange', refreshVisible);
    };
  }, [activeTab, loadPosts, selectedMonth, postSearch, postNetworkFilter, postFilterCasesOnly, refreshMetadata, invalidatePostsRequests]);

  useEffect(() => {
    if (activeTab !== 'COMMENTS') return;
    const refresh = () => {
      if (document.visibilityState !== 'visible') return;
      refreshTriage();
    };
    refresh();
    const poll = setInterval(refresh, 45000);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      clearInterval(poll);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, [activeTab, refreshTriage]);

  const filteredPosts = useMemo(() => {
    return postsList.filter(post => !postFilterCasesOnly || post.cases_count > 0);
  }, [postsList, postFilterCasesOnly]);

  const filteredCases = casesList;

  const drawerRawComments = useMemo(() => {
    if (!selectedPost) return [];
    // Only Meta captures belong in this tab. Historical case text stays in its case.
    return (selectedPost.raw_comments || []).map(comment => ({
      ...comment,
      conversation_analysis: selectedPost.conversation_analysis?.[comment.id],
      message: comment.message || comment.content || '',
      time: comment.time || comment.published_at,
    }));
  }, [selectedPost]);

  const drawerCasesById = useMemo(() => new Map<string, { id: string }>(
    (selectedPost?.cases || []).map((item: { id: string }) => [item.id, item] as const)
  ), [selectedPost]);

  const filteredDrawerComments = useMemo(() => {
    if (!selectedPost) return [];
    return drawerRawComments.filter((rc) => {
      const isCase = Boolean(rc.case_id);

      const isBot = rc.is_bot === true;
      const analysis = rc.conversation_analysis;
      const hasStance = analysis?.status === 'analyzed' && !analysis.needs_review;

      if (drawerCommentFilter === 'cases_only') return isCase;
      if (drawerCommentFilter === 'general_only') return !isCase;
      if (drawerCommentFilter === 'bots_only') return isBot;
      if (drawerCommentFilter === 'positive_only') return hasStance && analysis.stance === 'support';
      if (drawerCommentFilter === 'critics_only') return hasStance && analysis.stance === 'criticism';
      return true;
    });
  }, [drawerRawComments, selectedPost, drawerCommentFilter]);

  const handleResetFilters = () => {
    setFilterProvenance('all'); setIncludeDuplicates(false);
    setSearch('');
    setFilterPriority('all');
    setFilterCategory('all');
    setFilterSource('all');
    setFilterStatus('all');
    setFilterDepartment('all');
    setFilterPriorityOnly(false);
  };

  const hasActiveFilters = 
    search !== '' || 
    filterPriority !== 'all' || 
    filterCategory !== 'all' || 
    filterSource !== 'all' || 
    filterStatus !== 'all' || 
    filterDepartment !== 'all' || 
    filterPriorityOnly || filterProvenance !== 'all' || includeDuplicates;

  const getPriorityBadge = (priority: string) => {
    if (priority === 'Alta') return 'badge-alta';
    if (priority === 'Media') return 'badge-media';
    return 'badge-baja';
  };

  const getStatusBadge = (status: string) => {
    if (status === 'Resuelto') return 'badge-baja';
    if (status === 'En Gestión') return 'badge-blue';
    return 'badge-media';
  };

  const caseHref = (caseId: string) => {
    const params = new URLSearchParams({ view: 'cases' });
    for (const [key, value] of Object.entries({ search, priority: filterPriority, category: filterCategory, source: filterSource, status: filterStatus, department: filterDepartment, provenance: filterProvenance })) {
      if (value && value !== 'all') params.set(key, value);
    }
    if (caseOffset) params.set('skip', String(caseOffset));
    if (viewMode !== 'list') params.set('layout', viewMode);
    if (includeDuplicates) params.set('include_duplicates', 'true');
    if (filterPriorityOnly) params.set('priority_only', 'true');
    return '/cases/' + encodeURIComponent(caseId) + '?returnTo=' + encodeURIComponent('/cases?' + params.toString());
  };

  return (
    <div className={`page ${styles.casesWorkspace}`}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>Gestión de casos</h1>
          <p style={{ margin: '6px 0 12px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Revisa lo que llega de redes, atiende solicitudes y consulta su seguimiento.</p>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.74rem', flexWrap: 'wrap' }}>
            <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Canales de Escucha:</span>
            <span style={{ background: '#1877f2', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '0.68rem', fontWeight: 700 }}>📘 Facebook</span>
            <span title={instagramConnection?.detail} style={{ background: instagramConnection?.status === 'ready' ? 'linear-gradient(45deg, #f09433, #dc2743, #bc1888)' : 'var(--bg-muted)', color: instagramConnection?.status === 'ready' ? '#fff' : 'var(--text-secondary)', border: '1px solid var(--border)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.68rem', fontWeight: 700 }}>
              📷 Instagram {instagramConnection?.username ? `@${instagramConnection.username}` : !instagramConnection ? '· Verificando' : instagramConnection.status === 'not_connected' ? '· Sin vincular' : instagramConnection.status === 'missing_permissions' ? '· Faltan permisos' : instagramConnection.status === 'not_configured' ? '· Sin configurar' : instagramConnection.status === 'ready' ? '· Conectado' : '· No disponible'}
            </span>
            <span className="badge-tag" style={{ background: 'rgba(16, 185, 129, 0.12)', color: 'var(--emerald-600)', border: '1px solid rgba(16, 185, 129, 0.25)', fontSize: '0.68rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block', boxShadow: '0 0 6px #10b981' }} />
              Vista actualizada cada 45 s • {lastAutoSync}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            className={styles['sync-live-btn']}
            onClick={handleSyncLive}
            disabled={isSyncing}
            title="Sincronizar en tiempo real con Facebook e Instagram Graph API"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 16px', borderRadius: '8px', fontWeight: 600, fontSize: '0.84rem' }}
          >
            <RefreshCw size={15} className={isSyncing ? styles['spin-icon'] : ''} />
            <span>{isSyncing ? 'Actualizando fuentes…' : 'Actualizar fuentes'}</span>
          </button>
        </div>
      </div>

      {instagramConnection && (instagramConnection.status !== 'ready' || !instagramConnection.comments_available) && (
        <div role="status" style={{ padding: '12px 16px', marginBottom: '16px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-secondary)', fontSize: '0.8125rem', lineHeight: 1.5 }}>
          <strong style={{ color: 'var(--text-primary)' }}>Instagram: {instagramConnection.status === 'ready' ? 'comentarios pendientes de autorización' : 'conexión pendiente'}</strong>
          <p style={{ margin: '4px 0' }}>{instagramConnection.detail}</p>
          {instagramConnection.missing_permissions.length > 0 && <p style={{ margin: '4px 0' }}>Permisos faltantes: {instagramConnection.missing_permissions.join(', ')}.</p>}
          <span>Vincula la cuenta profesional a la página de Facebook en Meta Business Suite y autoriza Instagram en la conexión de Meta.</span>
        </div>
      )}

      {syncFeedback && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '12px 16px', borderRadius: 'var(--radius-md)',
          background: 'rgba(59, 130, 246, 0.12)', border: '1px solid rgba(59, 130, 246, 0.35)',
          color: 'var(--blue-600)', marginBottom: '1.25rem', fontSize: '0.85rem', fontWeight: 600
        }}>
          <Sparkles size={18} />
          <span>{syncFeedback}</span>
        </div>
      )}

      {/* Tabs Principales de la Bandeja */}
      <div className={styles['view-tabs']} role="group" aria-label="Qué quieres revisar">
        <button
          type="button"
          className={[styles['view-tab-btn'], activeTab === 'CASES' ? styles.active : ''].join(' ')}
          onClick={() => setActiveTab('CASES')}
          aria-pressed={activeTab === 'CASES'}
        >
          <FolderOpen size={16} />
          <span>Casos y seguimiento ({casesTotal})</span>
        </button>
<button
          type="button"
          className={[styles['view-tab-btn'], activeTab === 'COMMENTS' ? styles.active : ''].join(' ')}
          onClick={() => setActiveTab('COMMENTS')}
          aria-pressed={activeTab === 'COMMENTS'}
        >
          <Bot size={16} />
          <span>Revisar comentarios{rawComments.length > 0 ? ` (${rawComments.length} cargados)` : ''}</span>
        </button>
<button
          type="button"
          className={[styles['view-tab-btn'], activeTab === 'POSTS' ? styles.active : ''].join(' ')}
          onClick={() => setActiveTab('POSTS')}
          aria-pressed={activeTab === 'POSTS'}
        >
          <Layers size={16} />
          <span>Publicaciones{postsTotal > 0 ? ` (${postsTotal})` : ''}</span>
        </button>
      </div>

      {activeTab === 'POSTS' && (
      <div className="section-help">
        <div><strong>{activeTab === 'POSTS' ? 'Abre una publicación para ver sus comentarios' : activeTab === 'CASES' ? 'Selecciona un caso para atenderlo' : 'Revisa los comentarios que necesitan una decisión'}</strong>
          <p>{activeTab === 'POSTS' ? 'Cada tarjeta corresponde a una publicación. Dentro encontrarás todos los comentarios y las solicitudes vinculadas.' : activeTab === 'CASES' ? 'Usa los filtros de estado o prioridad. En el detalle puedes asignar la dependencia y registrar avances.' : 'Comprueba el problema detectado antes de vincular un comentario a un caso o crear una solicitud.'}</p></div>
        <Link href="/opinion">Ver apoyos y críticas a Johan <ArrowUpRight size={17} /></Link>
      </div>
      )}

      {groupSuccessMsg && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '12px 16px', borderRadius: 'var(--radius-md)',
          background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)',
          color: 'var(--emerald-600)', marginBottom: '1.25rem', fontSize: '0.875rem', fontWeight: 600
        }}>
          <CheckCircle2 size={18} />
          <span>{groupSuccessMsg}</span>{savedCaseId && <Link href={`/cases/${savedCaseId}`} style={{ marginLeft: 'auto', color: 'var(--text-link)' }}>Abrir caso y continuar <ArrowUpRight size={14} /></Link>}
        </div>
      )}

      {reviewComments && <TriageReviewModal comments={reviewComments} initialTarget={reviewTarget} initialMode={reviewMode} onClose={() => setReviewComments(null)} onSaved={result => {
        setReviewComments(null); setSelectedCommentIds([]); setSavedCaseId(result.case_id);
        setGroupSuccessMsg(`Caso ${result.case_id}: ${result.created ? 'creado' : 'actualizado'}. ${result.linked} comentarios nuevos vinculados.`);
        refreshTriage(); refreshCases();
      }} />}

      {/* VISTA 1: PUBLICACIONES META Y SUS CASOS ASOCIADOS */}
      {activeTab === 'POSTS' && (
        <div>
          {/* Banner explicativo del módulo con cobertura histórica */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.1rem 1.25rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexWrap: 'wrap'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.98rem', flexWrap: 'wrap' }}>
                <Layers size={18} style={{ color: 'var(--blue-600)' }} />
                <span>Monitoreo Histórico de Publicaciones Meta (Facebook & Instagram)</span>
                <span className="badge-tag" style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--blue-600)', border: '1px solid rgba(59, 130, 246, 0.25)' }}>
                  Página Oficial: Johan Steed
                </span>
                <span className="badge-tag" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--emerald-600)', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                  📅 {monthsList.find(month => month.key === 'all')?.label || 'Histórico sincronizado'}
                </span>
              </div>
              <p style={{ margin: '6px 0 0', fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Explora las publicaciones sincronizadas y busca en todo el histórico almacenado. Cada publicación agrupa sus comentarios y los casos territoriales clasificados por IA. Haz clic en <strong>Ver Casos</strong> para desplegar la bandeja de incidencias.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="badge-blue" style={{ fontSize: '0.8125rem', padding: '6px 12px', fontWeight: 700 }}>
                {postsTotal} Publicaciones
              </span>
              <span className="badge-alta" style={{ fontSize: '0.8125rem', padding: '6px 12px', fontWeight: 700 }}>
                {casesTotal} Casos Clasificados
              </span>
            </div>
          </div>

          {/* Barra de Filtros y Selector de Meses */}
          <div className={styles.toolbar}>
            <div className={styles.controls}>
              {/* Búsqueda por palabra clave o tema */}
              <div className={styles['search-wrap']}>
                <Search size={16} />
                <input 
                  type="text" 
                  placeholder="Buscar en publicaciones de Facebook e Instagram..." 
                  className={styles['search-input']} 
                  value={postSearch}
                  onChange={(e) => setPostSearch(e.target.value)}
                />
              </div>

              {/* Selector de Red Social (Todas / Facebook / Instagram) */}
              <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-muted)', padding: '3px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <button
                  type="button"
                  style={{
                    padding: '4px 10px', fontSize: '0.74rem', fontWeight: 600, borderRadius: '4px', border: 'none', cursor: 'pointer',
                    background: postNetworkFilter === 'all' ? 'var(--card-bg)' : 'transparent',
                    color: postNetworkFilter === 'all' ? 'var(--blue-600)' : 'var(--text-muted)',
                    boxShadow: postNetworkFilter === 'all' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none'
                  }}
                  onClick={() => setPostNetworkFilter('all')}
                >
                  Todas
                </button>
                <button
                  type="button"
                  style={{
                    padding: '4px 10px', fontSize: '0.74rem', fontWeight: 600, borderRadius: '4px', border: 'none', cursor: 'pointer',
                    background: postNetworkFilter === 'Facebook' ? '#1877f2' : 'transparent',
                    color: postNetworkFilter === 'Facebook' ? '#fff' : 'var(--text-muted)'
                  }}
                  onClick={() => setPostNetworkFilter('Facebook')}
                >
                  Facebook
                </button>
                <button
                  type="button"
                  style={{
                    padding: '4px 10px', fontSize: '0.74rem', fontWeight: 600, borderRadius: '4px', border: 'none', cursor: 'pointer',
                    background: postNetworkFilter === 'Instagram' ? 'linear-gradient(45deg, #f09433, #dc2743, #bc1888)' : 'transparent',
                    color: postNetworkFilter === 'Instagram' ? '#fff' : 'var(--text-muted)'
                  }}
                  onClick={() => setPostNetworkFilter('Instagram')}
                >
                  Instagram
                </button>
              </div>

              {/* Selector de meses del histórico sincronizado */}
              <div className={[styles['filter-dropdown-wrap'], selectedMonth !== 'all' ? styles.active : ''].join(' ')}>
                <Calendar size={14} className={styles['dropdown-icon']} />
                <select 
                  value={selectedMonth} 
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  title="Filtrar publicaciones por mes"
                  style={{ minWidth: '220px' }}
                >
                  <option value="all">📅 {monthsList.find(month => month.key === 'all')?.label || 'Todos los meses'} ({monthsList.find(month => month.key === 'all')?.count ?? 0})</option>
                  {monthsList.filter(m => m.key !== 'all').map(m => (
                    <option key={m.key} value={m.key}>
                      {m.label} ({m.count} publicaciones)
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className={styles['dropdown-arrow']} />
              </div>

              {/* Filtro: Solo con casos clasificados */}
              <button
                type="button"
                className={[styles['clear-btn'], postFilterCasesOnly ? styles.active : ''].join(' ')}
                onClick={() => setPostFilterCasesOnly(!postFilterCasesOnly)}
              >
                <FolderOpen size={14} />
                <span>Solo con casos clasificados</span>
              </button>

              {/* Botón de Limpiar Filtros */}
              {(selectedMonth !== 'all' || postSearch !== '' || postFilterCasesOnly) && (
                <button
                  type="button"
                  className={styles['clear-btn']}
                  onClick={() => {
                    setSelectedMonth('all');
                    setPostSearch('');
                    setPostFilterCasesOnly(false);
                  }}
                  title="Restablecer filtros de publicaciones"
                >
                  <RotateCcw size={14} />
                  <span>Limpiar filtros</span>
                </button>
              )}
            </div>

            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Mostrando {filteredPosts.length} de {postsTotal} publicaciones coincidentes
            </div>
          </div>

          {postsError && (
            <div role="alert" style={{ margin: '12px 0', color: 'var(--text-secondary)' }}>
              {postsError}{' '}
              <button type="button" className="btn-ghost" onClick={() => loadPosts()}>Reintentar</button>
            </div>
          )}
          {postsError && postsList.length === 0 ? null : loadingPosts && postsList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--text-muted)' }}>
              <Sparkles size={32} style={{ color: 'var(--blue-500)', margin: '0 auto 12px' }} />
              <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>Cargando publicaciones y portadas del histórico...</p>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className={styles['empty-state']}>
              <CheckCircle2 size={40} style={{ color: 'var(--blue-600)', margin: '0 auto 12px' }} />
              <h3>No se encontraron publicaciones con los filtros aplicados</h3>
              <p>Intenta seleccionar otro mes o restablecer la búsqueda por texto.</p>
              <button
                type="button"
                className="btn-primary"
                style={{ marginTop: '12px' }}
                onClick={() => {
                  setSelectedMonth('all');
                  setPostSearch('');
                  setPostFilterCasesOnly(false);
                }}
              >
                Ver todas las publicaciones
              </button>
            </div>
          ) : (
            <div className={styles['posts-grid']}>
              {filteredPosts.map(post => (
                <MonitoredPostCard key={post.id} post={post} selected={selectedPost?.id === post.id} onOpen={openPost} />
              ))}
            </div>
          )}
          {postsHasMore && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
              <button
                type="button"
                className="btn-primary"
                disabled={loadingPosts}
                onClick={() => loadPosts(loadedPostsCount.current)}
              >
                {loadingPosts ? 'Cargando publicaciones...' : 'Cargar más publicaciones antiguas'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* VISTA 2: CASOS CONSOLIDADOS */}
      {activeTab === 'CASES' && (
        <>
          <div className={styles.inboxStatuses} aria-label="Filtrar casos por estado">
            {(['all', 'Pendiente', 'En Gesti\u00f3n', 'Resuelto', 'No requiere gesti\u00f3n'] as const).map(value => <button key={value} aria-pressed={filterStatus === value} onClick={() => setFilterStatus(value)}>{value === 'all' ? 'Todos' : value === 'Pendiente' ? 'Pendientes' : value === 'Resuelto' ? 'Resueltos' : value === 'No requiere gesti\u00f3n' ? 'Sin solicitud' : value}</button>)}
            <span>{matchedCasesTotal} registros coincidentes</span>
          </div>
          <div className={styles.toolbar}>
        <div className={styles.controls}>
          {/* Búsqueda */}
          <div className={styles['search-wrap']}>
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Buscar por palabra clave, barrio, secretaría o caso..." 
              className={styles['search-input']} 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <details className={styles.advancedFilters}><summary><Filter size={15} />Filtros{hasActiveFilters && <span className={styles.filterDot} />}</summary><div className={styles.filterBody}>
          <div className={[styles['filter-dropdown-wrap'], filterProvenance !== 'all' ? styles.active : ''].join(' ')}>
            <ShieldAlert size={14} className={styles['dropdown-icon']} />
            <select aria-label="Filtrar por procedencia" value={filterProvenance} onChange={event => setFilterProvenance(event.target.value as 'all' | 'needs_review' | 'recovered_local')}>
              <option value="all">Procedencia: Todas</option><option value="needs_review">Origen pendiente de verificar</option><option value="recovered_local">Origen recuperado de captura</option>
            </select>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}><input type="checkbox" checked={includeDuplicates} onChange={event => setIncludeDuplicates(event.target.checked)} />Incluir duplicados vinculados</label>
          {/* Dropdown de Prioridad */}
          <div className={[styles['filter-dropdown-wrap'], filterPriority !== 'all' ? styles.active : ''].join(' ')}>
            <Filter size={14} className={styles['dropdown-icon']} />
            <select 
              value={filterPriority} 
              onChange={(e) => setFilterPriority(e.target.value)}
              title="Filtrar por nivel de prioridad"
            >
              <option value="all">Prioridad: Todos</option>
              <option value="Alta">🔴 Alta</option>
              <option value="Media">🟡 Media</option>
              <option value="Baja">🟢 Baja</option>
            </select>
            <ChevronDown size={14} className={styles['dropdown-arrow']} />
          </div>

          {/* Dropdown de Dependencia / Entidad */}
          <div className={[styles['filter-dropdown-wrap'], filterDepartment !== 'all' ? styles.active : ''].join(' ')}>
            <Building2 size={14} className={styles['dropdown-icon']} />
            <select 
              value={filterDepartment} 
              onChange={(e) => setFilterDepartment(e.target.value)}
              title="Filtrar por dependencia de Neiva"
            >
              <option value="all">Entidad: Todas</option>
              {NEIVA_ENTITIES.map(ent => (
                <option key={ent} value={ent}>{ent}</option>
              ))}
            </select>
            <ChevronDown size={14} className={styles['dropdown-arrow']} />
          </div>

          {/* Dropdown de Categoría */}
          <div className={[styles['filter-dropdown-wrap'], filterCategory !== 'all' ? styles.active : ''].join(' ')}>
            <Tag size={14} className={styles['dropdown-icon']} />
            <select 
              value={filterCategory} 
              onChange={(e) => setFilterCategory(e.target.value)}
              title="Filtrar por categoría del problema"
            >
              <option value="all">Categoría: Todas</option>
              <option value="Servicios Públicos">Servicios Públicos</option>
              <option value="Infraestructura">Infraestructura</option>
              <option value="Seguridad">Seguridad</option>
              <option value="Salud">Salud</option>
              <option value="Movilidad">Movilidad</option>
              <option value="Medio Ambiente">Medio Ambiente</option>
            </select>
            <ChevronDown size={14} className={styles['dropdown-arrow']} />
          </div>

          {/* Dropdown de Estado de Gestión */}
          <div className={[styles['filter-dropdown-wrap'], filterStatus !== 'all' ? styles.active : ''].join(' ')}>
            <ShieldAlert size={14} className={styles['dropdown-icon']} />
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              title="Filtrar por estado del caso"
            >
              <option value="all">Estado: Todos</option>
              <option value="Pendiente">Pendiente</option>
              <option value="En Gestión">En Gestión</option>
              <option value="Resuelto">Resuelto</option>
            </select>
            <ChevronDown size={14} className={styles['dropdown-arrow']} />
          </div>

          {/* Filtro Botón Prioridad Alcaldía */}
          <button 
            type="button"
            className={[styles['clear-btn'], filterPriorityOnly ? styles.active : ''].join(' ')}
            style={filterPriorityOnly ? { background: '#fef2f2', borderColor: '#ef4444', color: '#b91c1c' } : {}}
            onClick={() => setFilterPriorityOnly(!filterPriorityOnly)}
            title="Mostrar solo casos con Prioridad Inmediata Alcaldía"
          >
            <Flame size={13} className={filterPriorityOnly ? 'text-red-600' : ''} /> Prioridad Alcaldía
          </button>

          {/* Botón Limpiar Filtros */}
          {hasActiveFilters && (
            <button 
              className={styles['clear-btn']} 
              onClick={handleResetFilters}
              title="Restablecer todos los filtros"
            >
              <RotateCcw size={13} /> Limpiar
            </button>
          )}

          </div></details>

        </div>

        {/* Selector de vistas */}
        <div className={styles['view-switcher']}>
          <button 
            className={[styles['view-btn'], viewMode === 'card' ? styles.active : ''].join(' ')} 
            onClick={() => setViewMode('card')}
            title="Vista Detallada"
          >
            <LayoutGrid size={18} /> <span>Detalle</span>
          </button>
          <button 
            className={[styles['view-btn'], viewMode === 'compact' ? styles.active : ''].join(' ')} 
            onClick={() => setViewMode('compact')}
            title="Vista Cuadrícula"
          >
            <Menu size={18} /> <span>Cuadrícula</span>
          </button>
          <button 
            className={[styles['view-btn'], viewMode === 'list' ? styles.active : ''].join(' ')} 
            onClick={() => setViewMode('list')}
            title="Vista Lista"
          >
            <ListIcon size={18} /> <span>Lista</span>
          </button>
          <button 
            className={[styles['view-btn'], viewMode === 'table' ? styles.active : ''].join(' ')} 
            onClick={() => setViewMode('table')}
            title="Vista Tabla"
          >
            <TableIcon size={18} /> <span>Tabla</span>
          </button>
        </div>
      </div>

      {casesError && <div role="alert" style={{ padding: 16, color: 'var(--red-600)' }}>{casesError} <button type="button" className="btn-ghost" onClick={() => refreshCases()}>Reintentar</button></div>}
      {casesLoading && <p role="status">Cargando casos...</p>}
      {!casesLoading && !casesError && matchedCasesTotal === 0 && <p>No se encontraron casos con estos filtros.</p>}
      <div aria-busy={casesLoading} style={{ opacity: casesLoading ? 0.55 : 1 }}>
      {/* Renderizado de Vistas */}
      {viewMode === 'card' && (
        <div>
          {filteredCases.map((c) => (
            <div key={c.id} className={styles['case-card']}>
              <div className={styles['case-card-body']}>
                <div className={styles['case-preview']}>
                  <div className={styles['post-author']}>
                    <div className={styles['post-author-info']}>
                      <div className={styles['post-avatar']}>{c.source.charAt(0)}</div>
                      <div>
                        <div className={styles['post-name']}>{c.author}</div>
                        <div className={styles['post-meta']}>
                          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>🕒 {c.dateTime}</span> • <span>{c.source}</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px' }}>
                      <span className={styles['post-id']}>{c.id}</span>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', background: 'var(--bg-muted)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border)' }}>
                        {c.institutional_radicado ? `Rad: ${c.institutional_radicado}` : 'Sin radicado externo'}
                      </span>
                    </div>
                  </div>

                  <CaseProvenanceNote status={c.provenance_status} reason={c.provenance_reason} conflict={c.provenance_conflict} duplicateOf={c.duplicate_of} />
                  <div className={styles['source-context']}>
                    <span className={styles['source-context-label']}>PUBLICACIÓN DONDE SE COMENTÓ</span>
                    {c.post_title ? <>
                      <strong>{c.post_title}</strong>
                      {c.post_message && c.post_message !== c.post_title && <p>{c.post_message}</p>}
                      {c.post_permalink_url && <a href={c.post_permalink_url} target="_blank" rel="noopener noreferrer">Abrir publicación original <ExternalLink size={13} /></a>}
                    </> : <p className={styles['source-warning']}>{c.post_id ? 'Solo hay una referencia histórica; falta recuperar la publicación original. Este origen aún no está verificado.' : 'Este registro no tiene una referencia de publicación verificable. Requiere auditar su procedencia.'}</p>}
                    {!c.comment_id && <p className={styles['source-warning']}>No hay un identificador individual de comentario registrado. El texto no debe considerarse verificado solo por aparecer aquí.</p>}
                  </div>

                  {c.imageUrl ? (
                    <div className={styles['media-thumb']}><CaseCover src={c.thumbnailUrl || c.imageUrl} title={c.post_title || c.title} /></div>
                  ) : (
                    <div className={styles['source-unavailable']}>
                      <Info size={17} aria-hidden="true" />
                      <div><strong>Sin imagen de origen disponible</strong><p>{c.post_id && !c.post_title ? 'La publicación de origen no está guardada en Ordenemos a Neiva. Se conserva el comentario capturado.' : 'No hay una imagen original guardada para este caso. Puedes revisar el comentario y su seguimiento.'}</p></div>
                    </div>
                  )}

                  <span className={styles['source-context-label']}>TÍTULO REGISTRADO DEL CASO</span>
                  <h3 className={styles['post-title']}>{c.title}</h3>

                  <div style={{
                    background: 'var(--bg-muted)',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    borderLeft: '3px solid var(--blue-600)',
                    width: '100%'
                  }}>
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      💬 Texto registrado del comentario
                    </span>
                    <p className={styles['post-content']} style={{ margin: '3px 0 0', fontStyle: 'italic', color: 'var(--text-primary)' }}>
                      &quot;{c.content}&quot;
                    </p>
                    {c.comment_url && <a href={c.comment_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-link)', fontSize: '.8rem' }}>Ver comentario en Facebook <ExternalLink size={13} /></a>}
                  </div>
                </div>

                <div className={styles['case-analysis']}>
                  <div>
                    <div className={styles.tags}>
                      <span className={getPriorityBadge(c.priority)}>Prioridad {c.priority}</span>
                      <span className={getStatusBadge(c.status)}>{c.status}</span>
                      <span className="badge-tag" style={{ background: 'rgba(59, 130, 246, 0.08)', color: 'var(--blue-600)', border: '1px solid rgba(59, 130, 246, 0.25)', fontWeight: 600 }}>
                        💬 {c.comments_count || 1} {c.comments_count === 1 ? 'comentario' : 'comentarios'} Meta
                      </span>
                      {c.priority_action && (
                        <span style={{ 
                          display: 'inline-flex', alignItems: 'center', gap: '4px',
                          background: '#fee2e2', color: '#b91c1c', border: '1px solid #f87171',
                          borderRadius: '999px', padding: '3px 10px', fontSize: '0.7rem', fontWeight: 700 
                        }}>
                          <Flame size={12} /> Prioridad Alcaldía
                        </span>
                      )}
                      {c.assigned_department && (
                        <span className="badge-tag">
                          🏢 {c.assigned_department}
                        </span>
                      )}
                      <span className="badge-tag">{c.location}</span>
                      <span className="badge-tag">{c.category}</span>
                      {(() => {
                        const emo = getEmotionConfig(c.sentiment);
                        return (
                          <span 
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              fontSize: '0.73rem',
                              fontWeight: 600,
                              background: emo.bg,
                              border: `1px solid ${emo.border}`,
                              color: emo.color
                            }}
                            title={`Rueda de Sentimientos: ${emo.primary} - ${emo.sub}`}
                          >
                            <span>{emo.emoji}</span>
                            <span>{emo.primary}: <strong>{emo.sub}</strong></span>
                          </span>
                        );
                      })()}
                    </div>

                    <div className={styles['attention-summary']}>
                      <h4>Seguimiento del caso</h4>
                      <dl><div><dt>Responsable</dt><dd>{c.assigned_to || 'Sin asignar'}</dd></div><div><dt>Entidad o equipo registrado</dt><dd>{c.assigned_department || 'Sin asignar'}</dd></div></dl>
                      <p><strong>Siguiente paso: </strong>{c.status === 'Resuelto' ? 'Consulta la solución y el historial en el detalle.' : c.status === 'No requiere gestión' ? 'Consulta el registro del comentario y la decisión tomada.' : !c.assigned_to ? 'Revisa si el comentario contiene una solicitud real. Si necesita atención, asigna una persona responsable.' : 'Abre el caso para registrar avances y documentar su atención.'}</p>
                    </div>
                    {(c.impact_if_solved || c.impact_if_ignored) && <div className={styles['impact-box']}>
                      <div className={styles['impact-title']}>Evaluación registrada, por verificar</div>
                      {c.impact_if_solved && <p>{c.impact_if_solved}</p>}
                      {c.impact_if_ignored && <p>{c.impact_if_ignored}</p>}
                    </div>}
                  </div>

                  <div className={styles['case-actions']}>
                    <Link prefetch={false} href={caseHref(c.id)} className="btn-primary">
                      Abrir Caso <ArrowUpRight size={16} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {viewMode === 'compact' && (
        <div className={styles['compact-grid']}>
          {filteredCases.map((c) => (
            <div key={c.id} className={styles['compact-card']}>
              {(
                <div className={styles['compact-thumb']}>
                  <CaseCover src={c.thumbnailUrl || c.imageUrl} title={c.post_title || c.title} />
                </div>
              )}
              <div style={{ width: '100%' }}>
                <div className={styles['compact-meta']}>{c.id} • 🕒 {c.dateTime} • {c.source}</div>
                <h3 className={styles['compact-title']}>{c.title}</h3><CaseProvenanceNote status={c.provenance_status} reason={c.provenance_reason} conflict={c.provenance_conflict} duplicateOf={c.duplicate_of} />
                <p className={styles['compact-text']}>{c.content}</p>
                <div className={styles.tags} style={{ marginTop: '8px' }}>
                  <span className={getPriorityBadge(c.priority)}>{c.priority}</span>
                  <span className={getStatusBadge(c.status)}>{c.status}</span>
                  {c.priority_action && (
                    <span style={{ 
                      display: 'inline-flex', alignItems: 'center', gap: '3px',
                      background: '#fee2e2', color: '#b91c1c', border: '1px solid #f87171',
                      borderRadius: '999px', padding: '2px 8px', fontSize: '0.65rem', fontWeight: 700 
                    }}>
                      <Flame size={11} /> Alcaldía
                    </span>
                  )}
                  {c.assigned_department && (
                    <span className="badge-tag">🏢 {c.assigned_department}</span>
                  )}
                  <span className="badge-tag">{c.location}</span>
                </div>
              </div>
              <div className={styles['compact-actions']}>
                <Link prefetch={false} href={caseHref(c.id)} className="btn-primary" style={{ width: '100%', textAlign: 'center' }}>
                  Abrir Caso <ArrowUpRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {viewMode === 'list' && (
        <div className={styles.caseInbox}>
          <div className={styles.inboxHeader} aria-hidden="true"><span>Comentario</span><span>Estado</span><span>Responsable</span><span /></div>
          {filteredCases.map(c => <article key={c.id} className={styles.inboxRow}>
            <div className={styles.inboxMessage}>
              <div className={styles.inboxAuthor}>{c.author}<span>{c.source}</span></div>
              <Link prefetch={false} href={caseHref(c.id)} className={styles.inboxText}>{c.content || c.title}</Link>
              <div className={styles.inboxMeta}><span>{c.id}</span><span>{c.dateTime}</span>{c.provenance_status === 'needs_review' && <span className={styles.inboxWarning}><ShieldAlert size={12} />Revisar origen</span>}{c.duplicate_of && <span>Duplicado de {c.duplicate_of}</span>}</div>
            </div>
            <div className={styles.inboxStatus}><span className={getStatusBadge(c.status)}>{c.status}</span><small>Prioridad {c.priority}</small></div>
            <div className={styles.inboxOwner}><strong>{c.assigned_to || 'Sin asignar'}</strong>{c.assigned_to && <small>{c.assigned_department}</small>}</div>
            <Link prefetch={false} href={caseHref(c.id)} className={styles.inboxOpen} aria-label={'Abrir caso ' + c.id}>Abrir<ArrowUpRight size={16} /></Link>
          </article>)}
        </div>
      )}

      {viewMode === 'table' && (
        <div className={styles['table-container']} role="region" aria-label="Tabla de casos" aria-describedby="cases-table-scroll-hint" tabIndex={0} data-horizontal-scroll>
          <p id="cases-table-scroll-hint" className="table-scroll-hint">Desliza la tabla para consultar todos los datos del caso.</p>
          <table className={styles.table}>
            <thead className={styles['table-head']}>
              <tr>
                <th>ID</th>
                <th>Detalle del Caso</th>
                <th>Dependencia Asignada</th>
                <th>Estado</th>
                <th>Prioridad</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody className={styles['table-body']}>
              {filteredCases.map((c) => (
                <tr key={c.id}>
                  <td className={styles['table-id']}>
                    {c.id}
                    {c.priority_action && (
                      <div style={{ color: '#ef4444', fontSize: '0.7rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '2px', marginTop: '2px' }}>
                        <Flame size={12} /> Alcaldía
                      </div>
                    )}
                  </td>
                  <td>
                    <div className={styles['table-title']}>{c.title}</div>{c.provenance_status && <small>{c.provenance_status === 'consolidated' ? 'Duplicidad revisada' : c.provenance_status === 'needs_review' ? 'Origen pendiente de verificar' : 'Origen recuperado de captura'}</small>}
                    <div className={styles['table-sub']}>{c.author} • {c.location} • 🕒 {c.dateTime}</div>
                  </td>
                  <td>
                    <span className="badge-tag">
                      {c.assigned_department || 'Sin asignar'}
                    </span>
                  </td>
                  <td><span className={getStatusBadge(c.status)}>{c.status}</span>{c.duplicate_of && <small>Duplicado de {c.duplicate_of}</small>}</td>
                  <td><span className={getPriorityBadge(c.priority)}>{c.priority}</span></td>
                  <td>
                    <Link prefetch={false} href={caseHref(c.id)} className="btn-primary" style={{ padding: '5px 12px', fontSize: '0.75rem' }}>
                      Revisar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      </div>
      <nav aria-label="Paginacion de casos" style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center', gap: 16, marginBlock: 20 }}>
        <button type="button" className="btn-ghost" disabled={casesLoading || caseOffset === 0} onClick={() => setCaseOffset(value => Math.max(0, value - CASE_PAGE_SIZE))}>Anterior</button>
        <span>{matchedCasesTotal ? caseOffset + 1 : 0} a {Math.min(caseOffset + casesList.length, matchedCasesTotal)} de {matchedCasesTotal}</span>
        <button type="button" className="btn-primary" disabled={casesLoading || caseOffset + CASE_PAGE_SIZE >= matchedCasesTotal} onClick={() => setCaseOffset(value => value + CASE_PAGE_SIZE)}>Siguiente</button>
      </nav>
        </>
      )}

      {activeTab === 'COMMENTS' && <CommentReviewQueue comments={rawComments} selectedIds={selectedCommentIds}
        loading={triageLoading} error={triageError} onSelect={setSelectedCommentIds} onReview={reviewSelection} onRefresh={refreshTriage} />}

      {/* DRAWER / BANDEJA LATERAL DEDICADA PARA EL POST SELECCIONADO */}
      {selectedPost && (
        <div className={styles['post-drawer-backdrop']} onClick={closePost}>
          <div className={styles['post-drawer']} role="dialog" aria-modal="true" aria-labelledby="case-post-drawer-title" onClick={(e) => e.stopPropagation()}>
            <div className={styles['post-drawer-header']}>
              <div className={styles['post-drawer-summary']}>
                {selectedPost.cover_image && (
                  <img 
                    src={selectedPost.thumbnail_url || selectedPost.cover_image}
                    alt="" 
                    style={{ width: '64px', height: '64px', borderRadius: 'var(--radius-md)', objectFit: 'cover', flexShrink: 0, border: '1px solid var(--border)' }}
                  />
                )}
                <div className={styles['post-drawer-info']}>
                  <div className={styles['post-drawer-meta']}>
                    <span className="badge-tag" style={{ fontSize: '0.68rem' }}>
                      {selectedPost.media_type === 'video' ? '🎥 VIDEO / REEL' : '📷 IMAGEN'}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      🕒 {selectedPost.published_at}
                    </span>
                  </div>
                  <h3 id="case-post-drawer-title" style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {selectedPost.title}
                  </h3>
                  <div className={styles['post-drawer-metrics']}>
                    {selectedPost.source !== 'Instagram' && <span className={styles['metric-pill']} title="Total de todos los tipos de reacción">
                      <Heart size={12} />
                      <strong>{selectedPost.reactions_count == null ? '—' : formatNumber(selectedPost.reactions_count)}</strong> Reacciones
                    </span>}
                    <span className={styles['metric-pill']} style={{ background: 'rgba(239, 68, 68, 0.08)', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.25)' }}>
                      <Heart size={12} />
                      <strong suppressHydrationWarning>{selectedPost.likes_count == null ? '—' : formatNumber(selectedPost.likes_count)}</strong> Me gusta
                    </span>
                    <span className={styles['metric-pill']} style={{ background: 'rgba(59, 130, 246, 0.08)', color: '#3b82f6', borderColor: 'rgba(59, 130, 246, 0.25)' }}>
                      <Eye size={12} />
                      <strong suppressHydrationWarning>{selectedPost.views_count == null ? '—' : formatNumber(selectedPost.views_count)}</strong> Vistas
                    </span>
                    <span className={styles['metric-pill']} style={{ background: 'rgba(139, 92, 246, 0.08)', color: '#8b5cf6', borderColor: 'rgba(139, 92, 246, 0.25)' }}>
                      <Share2 size={12} />
                      <strong suppressHydrationWarning>{selectedPost.shares_count == null ? '—' : formatNumber(selectedPost.shares_count)}</strong> Compartidos
                    </span>
                    <span className={styles['metric-pill']} style={{ background: 'rgba(245, 158, 11, 0.08)', color: '#f59e0b', borderColor: 'rgba(245, 158, 11, 0.25)' }}>
                      <MessageSquare size={12} />
                      <strong>{selectedPost.total_comments || 0}</strong> Comentarios
                    </span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={closePost}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '6px', borderRadius: 'var(--radius-sm)' }}
                aria-label="Cerrar panel"
              >
                <X size={20} />
              </button>
            </div>

            <div className={styles['post-drawer-body']}>
              {loadingPostDetails ? (
                <div role="status" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  Cargando comentarios y casos de la publicación...
                </div>
              ) : postDetailsError ? (
                <div role="alert" style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                  <p>{postDetailsError}</p>
                  <button type="button" className="btn-primary" onClick={() => openPost(selectedPost)}>Reintentar</button>
                </div>
              ) : (<>
              {/* Noticia / Contenido del post */}
              <div style={{ padding: '12px 14px', background: 'var(--bg-muted)', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5, border: '1px solid var(--border)' }}>
                <strong style={{ color: 'var(--text-primary)' }}>Contenido de la Publicación:</strong>
                <p style={{ margin: '6px 0 0', whiteSpace: 'pre-line' }}>{selectedPost.message}</p>
                {(selectedPost.source || '').toLowerCase().includes('facebook') && (
                  <Link href={`/opinion?post=${encodeURIComponent(selectedPost.id)}`} className="btn-secondary" style={{ marginTop: 12 }}>
                    Ver opinión sobre Johan y contexto
                  </Link>
                )}
                {selectedPost.permalink_url && (
                  <div style={{ marginTop: '8px' }}>
                    <a
                      href={selectedPost.permalink_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: '0.75rem', color: 'var(--blue-600)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                      <span>Ver publicación original en {selectedPost.source || 'Facebook'}</span>
                      <ArrowUpRight size={13} />
                    </a>
                  </div>
                )}
              </div>

              {/* Selector de sub-pestañas dentro del Drawer */}
              <div style={{
                display: 'flex',
                gap: '8px',
                marginBottom: '1rem',
                borderBottom: '1px solid var(--border)',
                paddingBottom: '8px',
                flexWrap: 'wrap'
              }}>
                <button
                  type="button"
                  onClick={() => setPostDrawerTab('CASES')}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: postDrawerTab === 'CASES' ? 'var(--action-primary)' : 'var(--bg-muted)',
                    color: postDrawerTab === 'CASES' ? '#fff' : 'var(--text-secondary)',
                    transition: 'all 150ms ease'
                  }}
                >
                  <FolderOpen size={15} />
                  <span>Casos vinculados ({selectedPost.cases?.length || 0})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPostDrawerTab('RAW_COMMENTS')}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: postDrawerTab === 'RAW_COMMENTS' ? 'var(--action-primary)' : 'var(--bg-muted)',
                    color: postDrawerTab === 'RAW_COMMENTS' ? '#fff' : 'var(--text-secondary)',
                    transition: 'all 150ms ease'
                  }}
                >
                  <MessageSquare size={15} />
                  <span>Todos los comentarios en {selectedPost.source || 'Facebook'} ({selectedPost.raw_comments?.length || selectedPost.total_comments})</span>
                </button>
              </div>

              {/* Nota explicativa de Ordenemos a Neiva */}
              <div style={{
                padding: '8px 12px',
                background: 'rgba(59, 130, 246, 0.06)',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1rem',
                border: '1px solid rgba(59, 130, 246, 0.15)',
                fontSize: '0.75rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.45
              }}>
                💡 <strong>¿Cómo funciona la clasificación?</strong> Ordenemos a Neiva analiza cada comentario recibido en Facebook. Los comentarios con quejas, huecos, luminarias, agua o solicitudes ciudadanas se radican automáticamente como <strong>Casos Institucionales</strong>. Los saludos o reacciones generales se conservan en la pestaña de comentarios completos.
              </div>

              {/* SUB-PESTAÑA 1: CASOS CLASIFICADOS */}
              {postDrawerTab === 'CASES' && (
                <div>
                  {(!selectedPost.cases || selectedPost.cases?.length === 0) ? (
                    <div className={styles['empty-state']} style={{ padding: '2rem 1rem' }}>
                      <CheckCircle2 size={36} style={{ color: 'var(--emerald-600)', margin: '0 auto 10px' }} />
                      <h4 style={{ margin: '0 0 6px', fontSize: '0.95rem' }}>Sin problemáticas críticas detectadas</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                        No hay casos vinculados a esta publicación. Puedes revisar las interacciones recibidas en la pestaña <strong>Todos los comentarios en {selectedPost.source || 'Facebook'}</strong>.
                      </p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {selectedPost.cases?.slice(0, visibleCaseCount).map((c) => (
                        <div
                          key={c.id}
                          style={{
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-lg)',
                            background: 'var(--bg-card)',
                            padding: '1.1rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '10px',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontWeight: 800, fontSize: '0.875rem', color: 'var(--blue-600)' }}>
                                {c.id}
                              </span>
                              <span className={getPriorityBadge(c.priority)} style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
                                {c.priority}
                              </span>
                              <span className={getStatusBadge(c.status)} style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
                                {c.status}
                              </span>
                            </div>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                              🕒 {c.date_time}
                            </span>
                          </div>

                          <div style={{
                            fontSize: '0.85rem',
                            color: 'var(--text-primary)',
                            background: 'var(--bg-muted)',
                            padding: '10px 12px',
                            borderRadius: 'var(--radius-md)',
                            borderLeft: '3px solid var(--blue-600)',
                            lineHeight: 1.5,
                            fontStyle: 'italic'
                          }}>
                            &quot;{c.content}&quot;
                          </div>

                          {(selectedPost.source || '').toLowerCase().includes('facebook') && <ConversationBadge analysis={selectedPost.conversation_analysis?.[c.comment_id || '']} />}

                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', flexWrap: 'wrap', gap: '6px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                              <CommentAuthor name={c.author} pictureUrl={c.author_picture_url} protectedProfile={c.author_is_protected} source={selectedPost.source} />
                              <span>📍 {c.location}</span>
                              {c.comment_permalink_url && (
                                <a href={c.comment_permalink_url} target="_blank" rel="noopener noreferrer" title="Ver el comentario original en Facebook" style={{ color: 'var(--blue-600)' }}>
                                  <ExternalLink size={13} />
                                </a>
                              )}
                            </div>
                            <div style={{ color: 'var(--text-muted)', fontWeight: 600 }}>
                              🏛️ {c.assigned_department}
                            </div>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '8px', borderTop: '1px solid var(--border)' }}>
                            <Link
                              href={`/cases/${c.id}`}
                              className="btn-primary"
                              style={{ fontSize: '0.78rem', padding: '6px 14px', borderRadius: 'var(--radius-md)' }}
                            >
                              <span>Gestionar Caso Completo</span>
                              <ArrowUpRight size={14} />
                            </Link>
                          </div>
                        </div>
                      ))}
                      {selectedPost.cases?.length > visibleCaseCount && (
                        <button type="button" className="btn-secondary" onClick={() => setVisibleCaseCount(count => count + 20)}>
                          Cargar más casos ({selectedPost.cases?.length - visibleCaseCount} restantes)
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* SUB-PESTAÑA 2: TODOS LOS COMENTARIOS EN FACEBOOK */}
              {postDrawerTab === 'RAW_COMMENTS' && (
                <div>
                  {/* Barra de Filtros de Comentarios en el Drawer */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '1rem',
                    flexWrap: 'wrap',
                    gap: '8px'
                  }}>
                    <div className={styles['drawer-comment-filters']}>
                      <button
                        type="button"
                        onClick={() => setDrawerCommentFilter('all')}
                        style={{
                          padding: '4px 10px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          border: '1px solid var(--border)',
                          background: drawerCommentFilter === 'all' ? 'var(--action-primary)' : 'var(--bg-muted)',
                          color: drawerCommentFilter === 'all' ? '#fff' : 'var(--text-secondary)'
                        }}
                      >
                        Todos ({drawerRawComments.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setDrawerCommentFilter('cases_only')}
                        style={{
                          padding: '4px 10px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          border: '1px solid var(--border)',
                          background: drawerCommentFilter === 'cases_only' ? 'var(--action-primary)' : 'var(--bg-muted)',
                          color: drawerCommentFilter === 'cases_only' ? '#fff' : 'var(--text-secondary)'
                        }}
                      >
                        Casos vinculados ({selectedPost.cases?.length || 0})
                      </button>
                      <button
                        type="button"
                        onClick={() => setDrawerCommentFilter('general_only')}
                        style={{
                          padding: '4px 10px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          border: '1px solid var(--border)',
                          background: drawerCommentFilter === 'general_only' ? 'var(--action-primary)' : 'var(--bg-muted)',
                          color: drawerCommentFilter === 'general_only' ? '#fff' : 'var(--text-secondary)'
                        }}
                      >
                        Aportes / Opinión
                      </button>
                      <button
                        type="button"
                        onClick={() => setDrawerCommentFilter('positive_only')}
                        style={{
                          padding: '4px 10px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          border: '1px solid var(--border)',
                          background: drawerCommentFilter === 'positive_only' ? '#10b981' : 'var(--bg-muted)',
                          color: drawerCommentFilter === 'positive_only' ? '#fff' : 'var(--text-secondary)'
                        }}
                      >
                        🟢 A favor de Johan
                      </button>
                      <button
                        type="button"
                        onClick={() => setDrawerCommentFilter('critics_only')}
                        style={{
                          padding: '4px 10px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          border: '1px solid var(--border)',
                          background: drawerCommentFilter === 'critics_only' ? '#f59e0b' : 'var(--bg-muted)',
                          color: drawerCommentFilter === 'critics_only' ? '#fff' : 'var(--text-secondary)'
                        }}
                      >
                        🔴 Críticas a Johan
                      </button>
                      <button
                        type="button"
                        onClick={() => setDrawerCommentFilter('bots_only')}
                        style={{
                          padding: '4px 10px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          border: '1px solid var(--border)',
                          background: drawerCommentFilter === 'bots_only' ? '#ef4444' : 'var(--bg-muted)',
                          color: drawerCommentFilter === 'bots_only' ? '#fff' : 'var(--text-secondary)'
                        }}
                      >
                        🤖 Bots / Granjas
                      </button>
                    </div>

                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      Mostrando {filteredDrawerComments.length} comentarios
                    </span>
                  </div>

                  {filteredDrawerComments.length === 0 ? (
                    <div className={styles['empty-state']} style={{ padding: '2rem 1rem' }}>
                      <MessageSquare size={36} style={{ color: 'var(--blue-500)', margin: '0 auto 10px' }} />
                      <h4 style={{ margin: '0 0 6px', fontSize: '0.95rem' }}>No hay comentarios con este filtro</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                        Selecciona &quot;Todos&quot; para ver todas las interacciones de la comunidad en esta publicación.
                      </p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {filteredDrawerComments.slice(0, visibleCommentCount).map((rc, idx) => {
                        const isBot = rc.is_bot === true;
                        const matchedCase = drawerCasesById.get(rc.case_id || '');
                        return (
                          <div
                            key={rc.id || idx}
                            style={{
                              border: '1px solid var(--border)',
                              borderRadius: 'var(--radius-md)',
                              background: 'var(--bg-card)',
                              padding: '12px 14px',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '6px'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                                <CommentAuthor name={rc.author} pictureUrl={rc.author_picture_url} protectedProfile={rc.author_is_protected} source={rc.source || selectedPost.source} />
                                {rc.permalink_url && (
                                  <a href={rc.permalink_url} target="_blank" rel="noopener noreferrer" title="Ver el comentario original en Facebook" style={{ color: 'var(--blue-600)' }}>
                                    <ExternalLink size={13} />
                                  </a>
                                )}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                  🕒 {rc.time || 'Reciente'}
                                </span>
                                {matchedCase ? (
                                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                    <span className="badge-blue" style={{ fontSize: '0.68rem', padding: '2px 8px', fontWeight: 700 }}>
                                      📁 Convertido en Caso {matchedCase.id}
                                    </span>
                                    <Link
                                      href={`/cases/${matchedCase.id}`}
                                      className="btn-primary"
                                      style={{ padding: '2px 8px', fontSize: '0.68rem', borderRadius: 'var(--radius-sm)' }}
                                      title="Abrir caso institucional"
                                    >
                                      <span>Ver Caso</span>
                                      <ArrowUpRight size={11} />
                                    </Link>
                                  </div>
                                ) : (
                                  <span className="badge-tag" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
                                    💬 Aporte Ciudadano / Opinión
                                  </span>
                                )}
                              </div>
                            </div>
                            <p style={{ margin: '4px 0 0', fontSize: '0.8125rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                              &quot;{rc.message}&quot;
                            </p>
                            {(selectedPost.source || '').toLowerCase().includes('facebook') && <ConversationBadge analysis={rc.conversation_analysis} />}

                            {/* Metadata de Perfil (Seguidores, Seguidos, Creación, Bot) */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px', flexWrap: 'wrap', gap: '6px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                <span style={{ fontSize: '0.68rem', padding: '1px 6px', borderRadius: '4px', background: 'var(--bg-muted)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                                  👥 {rc.followers_count ?? '—'} seg
                                </span>
                                <span style={{ fontSize: '0.68rem', padding: '1px 6px', borderRadius: '4px', background: 'var(--bg-muted)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                                  👤 {rc.following_count ?? '—'} seguidos
                                </span>
                                <span style={{ fontSize: '0.68rem', padding: '1px 6px', borderRadius: '4px', background: 'var(--bg-muted)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                                  📅 {rc.account_age || 'Antigüedad no disponible'}
                                </span>
                                {isBot && (
                                  <span style={{ fontSize: '0.68rem', padding: '1px 6px', borderRadius: '4px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.25)', fontWeight: 700 }}>
                                    🤖 Marcado para revisión de automatización
                                  </span>
                                )}
                              </div>

                              <button
                                type="button"
                                className="btn-secondary"
                                onClick={() => {
                                  if (activeSmartReplyCommentId === (rc.id || rc.message)) {
                                    setActiveSmartReplyCommentId(null);
                                  } else {
                                    handleGenerateCommentReply(rc);
                                  }
                                }}
                                style={{ fontSize: '0.72rem', padding: '3px 8px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                              >
                                <Sparkles size={12} style={{ color: 'var(--blue-600)' }} />
                                <span>{activeSmartReplyCommentId === (rc.id || rc.message) ? 'Ocultar' : '⚡ Respuesta IA'}</span>
                              </button>
                            </div>

                            {/* Despliegue de Respuesta Inteligente generada */}
                            {activeSmartReplyCommentId === (rc.id || rc.message) && (
                              <div style={{ marginTop: '8px', padding: '10px 12px', borderRadius: 'var(--radius-md)', background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.25)' }}>
                                {smartReplyError ? <p role="alert">{smartReplyError}</p> : smartReplyLoading ? (
                                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Generando respuesta institucional con IA...</div>
                                ) : (
                                  <>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                                      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--blue-600)' }}>
                                        💡 Borrador sugerido; requiere revisi?n ({smartReplyResult?.topic}):
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          if (smartReplyResult?.text) {
                                            navigator.clipboard.writeText(smartReplyResult.text);
                                            setSmartReplyCopied(true);
                                            setTimeout(() => setSmartReplyCopied(false), 2000);
                                          }
                                        }}
                                        style={{ fontSize: '0.68rem', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--border)', background: smartReplyCopied ? '#10b981' : 'var(--bg-muted)', color: smartReplyCopied ? '#fff' : 'var(--text-primary)', cursor: 'pointer', fontWeight: 700 }}
                                      >
                                        {smartReplyCopied ? '✓ Copiado' : 'Copiar Texto'}
                                      </button>
                                    </div>
                                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-primary)', lineHeight: 1.45 }}>
                                      &quot;{smartReplyResult?.text}&quot;
                                    </p>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                      {filteredDrawerComments.length > visibleCommentCount && (
                        <button type="button" className="btn-secondary" onClick={() => setVisibleCommentCount(count => count + 50)}>
                          Cargar más comentarios ({filteredDrawerComments.length - visibleCommentCount} restantes)
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
              </>)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CasesPage() {
  return <Suspense fallback={<div className="page" role="status">Cargando publicaciones y casos…</div>}><CasesContent /></Suspense>;
}

