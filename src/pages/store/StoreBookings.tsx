import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, Users, Archive, Filter, SortAsc, RefreshCw } from "lucide-react";
import { DataTable } from "@/components/admin/DataTable";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format, isToday, parseISO, subMonths, startOfDay, endOfDay, subDays } from "date-fns";
import { ja } from "date-fns/locale";
import { Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DateRange } from "react-day-picker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  CalendarIcon,
  CheckSquare,
  SortDesc,
  AlertCircle,
  Trash,
  Pencil,
  X,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DayPicker } from 'react-day-picker';
import {
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { BellIcon } from "lucide-react";
import { sendBookingConfirmationToClient, sendStoreResponseNotificationToTherapist, sendBookingRejectionToClient } from "@/utils/notification-service";

// Update the BookingData interface to explicitly include column names with spaces
interface BookingData {
  id: string;
  therapist_id: string;
  user_id: string;
  service_id: string;
  date: string;
  "status therapist"?: string;
  "status store"?: string;
  notes?: string;
  location?: string;
  price?: number;
  created_at: string;
  [key: string]: any; // Allow for dynamic property access
}

// Define booking interface
interface Booking {
  id: string;
  clientName: string;
  clientAvatar?: string;
  clientEmail?: string;
  therapistName: string;
  therapistId: string;
  serviceName: string;
  serviceId: string;
  date: string;
  time: string;
  originalDate: string; // ISO date for sorting
  status: string; // Combined status for display
  therapistStatus?: string; // Added for the dual status system
  storeStatus?: string; // Added for the dual status system
  price: number;
  location: string;
  notes?: string;
  userId: string;
  created_at?: string; // Add created_at for tracking new bookings
}

interface TherapistOption {
  id: string;
  name: string;
}

// Helper function to get Japanese status text
const getJapaneseStatus = (status: string): string => {
  switch (status) {
    case "confirmed": return "確定";
    case "cancelled": return "キャンセル";
    case "completed": return "完了";
    case "pending":
    default: return "仮予約";
  }
};

// Helper function to get status color
const getStoreStatusColor = (status: string): string => {
  switch (status) {
    case "confirmed": return "bg-green-100 text-green-800 border-0";
    case "cancelled": return "bg-red-100 text-red-800 border-0";
    case "completed": return "bg-blue-100 text-blue-800 border-0";
    case "pending":
    default: return "bg-yellow-100 text-yellow-800 border-0";
  }
};

// Helper function for combined status color
const getCombinedStatusColor = (japaneseStatus: string): string => {
  switch (japaneseStatus) {
    case "確定": return "bg-green-100 text-green-800 border-0";
    case "キャンセル": return "bg-red-100 text-red-800 border-0";
    case "完了": return "bg-blue-100 text-blue-800 border-0";
    case "仮予約":
    default: return "bg-yellow-100 text-yellow-800 border-0";
  }
};

const StoreBookings = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [therapistFilter, setTherapistFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest" | "price-high" | "price-low" | "status" | "therapist">("newest");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [todayBookings, setTodayBookings] = useState<Booking[]>([]);
  const [filteredResults, setFilteredResults] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [storeId, setStoreId] = useState<string | null>(null);
  const [therapists, setTherapists] = useState<TherapistOption[]>([]);
  const [showBookingDetails, setShowBookingDetails] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [sortOption, setSortOption] = useState<string>('date-desc');
  const [newBookingsCount, setNewBookingsCount] = useState(0);
  const [newTodayBookingsCount, setNewTodayBookingsCount] = useState(0);
  
  // Fetch bookings from Supabase
  const fetchBookings = async () => {
    try {
      console.log("Starting to fetch bookings...");
      setLoading(true);
      setError(null);

      // Get current store ID
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) {
        console.error("Auth error:", authError);
        throw new Error("Authentication error: " + authError.message);
      }
      
      if (!user) {
        console.error("No authenticated user found");
        throw new Error("User not authenticated");
      }
      
      console.log("Authenticated user:", user.id);
      setStoreId(user.id);

      // Get all store's therapists
      console.log("Fetching store therapists for store:", user.id);
      const { data: storeTherapists, error: therapistsError } = await supabase
        .from("store_therapists")
        .select("therapist_id, status")
        .eq("store_id", user.id);

      if (therapistsError) {
        console.error("Error fetching store therapists:", therapistsError);
        throw therapistsError;
      }
      
      console.log("Store therapists data:", storeTherapists);
      
      if (!storeTherapists || storeTherapists.length === 0) {
        console.log("No therapists found for this store");
        setBookings([]);
        setTodayBookings([]);
        setLoading(false);
        return;
      }

      // Filter only active therapists
      const activeTherapists = storeTherapists.filter(t => t.status === "active");
      const therapistIds = activeTherapists.map(t => t.therapist_id);
      
      console.log(`Found ${therapistIds.length} active therapists for this store:`, therapistIds);
      
      // Check if our specific therapist is included
      const includesTargetTherapist = therapistIds.includes("d4a60272-81aa-4866-89dd-1330fb38e02a");
      console.log("Includes target therapist?", includesTargetTherapist);

      // Get bookings for all store's therapists
      console.log("Fetching bookings for therapists:", therapistIds);
      
      // Using RPC call to avoid column name issues with spaces
      const { data: bookingsData, error: bookingsError } = await supabase
        .from("bookings")
        .select("*")
        .in("therapist_id", therapistIds) as { data: BookingData[] | null, error: any };

      if (bookingsError) {
        console.error("Error fetching bookings:", bookingsError);
        throw bookingsError;
      }
      
      console.log(`Retrieved ${bookingsData?.length || 0} bookings:`, bookingsData);
      
      // Check for our specific therapist's bookings
      if (bookingsData) {
        const targetTherapistBookings = bookingsData.filter(b => b.therapist_id === "d4a60272-81aa-4866-89dd-1330fb38e02a");
        console.log(`Found ${targetTherapistBookings.length} bookings for target therapist:`, targetTherapistBookings);
      }
      
      if (!bookingsData || bookingsData.length === 0) {
        console.log("No bookings found for any therapist");
        setBookings([]);
        setTodayBookings([]);
        setFilteredResults([]);
        setLoading(false);
        return;
      }

      // Get user profiles to get client names
      const userIds = bookingsData.map(booking => booking.user_id).filter(Boolean);
      console.log("Fetching profiles for users:", userIds);
      const { data: userProfiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, name, nickname, email, avatar_url")
        .in("id", userIds);

      if (profilesError) {
        console.error("Error fetching user profiles:", profilesError);
        throw profilesError;
      }

      // Get therapist profiles to get therapist names
      console.log("Fetching profiles for therapists:", therapistIds);
      const { data: therapistProfiles, error: therapistProfileError } = await supabase
        .from("therapists")
        .select("id, name")
        .in("id", therapistIds);

      if (therapistProfileError) {
        console.error("Error fetching therapist profiles:", therapistProfileError);
        throw therapistProfileError;
      }
      
      // Build therapist options for filter dropdown
      if (therapistProfiles && therapistProfiles.length > 0) {
        const therapistOptions = therapistProfiles.map(t => ({
          id: t.id,
          name: t.name || "名前なし"
        }));
        setTherapists(therapistOptions);
        console.log("Set therapist options for filtering:", therapistOptions);
      }

      // Get services to get service names
      const serviceIds = bookingsData.map(booking => booking.service_id).filter(Boolean);
      console.log("Fetching services:", serviceIds);
      const { data: services, error: servicesError } = serviceIds.length > 0 ? await supabase
        .from("services")
        .select("id, name")
        .in("id", serviceIds) : { data: [], error: null };

      if (servicesError) {
        console.error("Error fetching services:", servicesError);
        throw servicesError;
      }

      // Map data to UI format
      console.log("Formatting booking data for UI");
      const formattedBookings: Booking[] = bookingsData.map(booking => {
        const client = userProfiles?.find(user => user.id === booking.user_id);
        const therapist = therapistProfiles?.find(t => t.id === booking.therapist_id);
        const service = services?.find(s => s.id === booking.service_id);
        
        const bookingDate = parseISO(booking.date);
        const formattedDate = format(bookingDate, "yyyy-MM-dd", { locale: ja });
        const formattedTime = format(bookingDate, "HH:mm", { locale: ja }) + "-" + 
                             format(new Date(bookingDate.getTime() + 60*60*1000), "HH:mm", { locale: ja }); // Assuming 1 hour sessions
        
        // Get individual statuses - handle column names with spaces
        const therapistStatus = booking["status therapist"] || "pending";
        const storeStatus = booking["status store"] || "pending";
        
        // Calculate combined status
        const combinedStatus = calculateCombinedStatus(therapistStatus, storeStatus);
        
        return {
          id: booking.id,
          clientName: client?.name || client?.nickname || "名前なし",
          clientAvatar: client?.avatar_url || undefined,
          clientEmail: client?.email || undefined,
          therapistName: therapist?.name || "未定",
          therapistId: booking.therapist_id,
          serviceName: service?.name || "未定",
          serviceId: booking.service_id || "",
          date: formattedDate,
          time: formattedTime,
          originalDate: booking.date || "",
          therapistStatus: therapistStatus,
          storeStatus: storeStatus,
          status: getJapaneseStatus(combinedStatus),
          price: booking.price || 0,
          location: booking.location || "",
          notes: booking.notes || "",
          userId: booking.user_id,
          created_at: booking.created_at
        };
      });

      console.log(`Formatted ${formattedBookings.length} bookings for display`);
      
      // Calculate new bookings count
      const oneDayAgo = subDays(new Date(), 1);
      const newBookings = formattedBookings.filter(booking => 
        (booking.status === "仮予約") || 
        (booking.created_at && new Date(booking.created_at) > oneDayAgo)
      );
      setNewBookingsCount(newBookings.length);
      
      // Calculate new today bookings count
      const newTodayBookings = newBookings.filter(booking => 
        isToday(parseISO(booking.originalDate))
      );
      setNewTodayBookingsCount(newTodayBookings.length);
      
      // Set all bookings and filter today's bookings
      setBookings(formattedBookings);
      setTodayBookings(formattedBookings.filter(booking => isToday(parseISO(booking.originalDate))));
      
      // Apply initial filtering and sorting
      applyFiltersAndSorting(formattedBookings);
      
      console.log("Booking data fetch complete");
    } catch (error) {
      console.error("Error fetching bookings:", error);
      setError((error as Error).message);
      toast({
        title: "エラー",
        description: "予約データの取得に失敗しました",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);
  
  // Apply filters and sorting whenever filter/sort criteria change
  useEffect(() => {
    applyFiltersAndSorting(bookings);
  }, [searchQuery, statusFilter, therapistFilter, sortOrder, dateRange, bookings]);
  
  // Apply all filters and sorting to the data
  const applyFiltersAndSorting = (data: Booking[]) => {
    console.log("Applying filters and sorting", { 
      statusFilter, 
      therapistFilter, 
      sortOrder, 
      dateRange,
      searchQuery 
    });
    
    let filtered = [...data];
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(booking => 
        booking.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.therapistName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.serviceName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply status filter
    if (statusFilter !== "all") {
      const statusMap: Record<string, string> = {
        "pending": "仮予約",
        "confirmed": "確定",
        "cancelled": "キャンセル",
        "completed": "完了"
      };
      filtered = filtered.filter(booking => booking.status === statusMap[statusFilter]);
    }
    
    // Apply therapist filter
    if (therapistFilter !== "all") {
      filtered = filtered.filter(booking => booking.therapistId === therapistFilter);
    }
    
    // Apply date range filter
    if (dateRange && dateRange.from) {
      const fromDate = startOfDay(dateRange.from);
      const toDate = dateRange.to ? endOfDay(dateRange.to) : endOfDay(dateRange.from);
      
      filtered = filtered.filter(booking => {
        const bookingDate = parseISO(booking.originalDate);
        return bookingDate >= fromDate && bookingDate <= toDate;
      });
    }
    
    // Apply sorting
    switch (sortOrder) {
      case "newest":
        filtered.sort((a, b) => b.originalDate.localeCompare(a.originalDate));
        break;
      case "oldest":
        filtered.sort((a, b) => a.originalDate.localeCompare(b.originalDate));
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "status":
        filtered.sort((a, b) => a.status.localeCompare(b.status));
        break;
      case "therapist":
        filtered.sort((a, b) => a.therapistName.localeCompare(b.therapistName));
        break;
    }
    
    console.log(`Filtered from ${data.length} to ${filtered.length} bookings`);
    setFilteredResults(filtered);
  };
  
  const handleRefresh = () => {
    setRefreshing(true);
    fetchBookings();
  };
  
  // Column definition for the bookings table
  const columns = [
    {
      key: "clientName",
      label: "顧客名",
      accessorKey: "clientName"
    },
    {
      key: "therapistName",
      label: "担当セラピスト",
      accessorKey: "therapistName"
    },
    {
      key: "service",
      label: "サービス",
      accessorKey: "serviceName"
    },
    {
      key: "date",
      label: "日付",
      accessorKey: "date"
    },
    {
      key: "time",
      label: "時間",
      accessorKey: "time"
    },
    {
      key: "status",
      label: "ステータス",
      accessorKey: "status",
      render: ({ row }: any) => {
        // Get status colors based on our helper functions
        const storeStatusColor = getStoreStatusColor(row.storeStatus || "pending");
        const combinedStatusColor = getCombinedStatusColor(row.status);
        
        // If booking is less than 24 hours old or pending, mark as "new"
        const oneDayAgo = subDays(new Date(), 1);
        const isNew = row.status === "仮予約" || (row.created_at && new Date(row.created_at) > oneDayAgo);
        
        // Get approval status text
        const approvalStatusText = getApprovalStatusText(row.therapistStatus, row.storeStatus);
        
        return (
          <div className="flex items-center">
            {isNew && (
              <div className="mr-2 h-2 w-2 rounded-full bg-red-500" title="新規予約"></div>
            )}
            <div className="flex flex-col">
              <Select 
                defaultValue={row.storeStatus || "pending"}
                onValueChange={(value) => {
                  switch (value) {
                    case "confirmed":
                      handleConfirmBooking(row.id);
                      break;
                    case "cancelled":
                      handleCancelBooking(row.id);
                      break;
                    case "completed":
                      handleCheckIn(row.id);
                      break;
                  }
                }}
              >
                <SelectTrigger className="h-8 w-[110px]">
                  <SelectValue>
                    <Badge variant="outline" className={storeStatusColor}>
                      {getJapaneseStatus(row.storeStatus || "pending")}
                    </Badge>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">仮予約</SelectItem>
                  <SelectItem value="confirmed">確定</SelectItem>
                  <SelectItem value="completed">完了</SelectItem>
                  <SelectItem value="cancelled">キャンセル</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex flex-col mt-1">
                {approvalStatusText && (
                  <span className="text-xs text-muted-foreground">{approvalStatusText}</span>
                )}
                {row.status !== getJapaneseStatus(row.storeStatus || "pending") && (
                  <span className="text-xs">
                    予約状態: <Badge variant="outline" className={combinedStatusColor}>{row.status}</Badge>
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      }
    },
    {
      key: "price",
      label: "料金",
      accessorKey: "price",
      render: ({ row }: any) => row.price.toLocaleString() + "円"
    },
    {
      key: "actions",
      label: "操作",
      render: ({ row }: any) => (
        <div className="flex space-x-2">
          <Button size="sm" variant="outline" onClick={() => handleViewBookingDetails(row)}>詳細</Button>
        </div>
      )
    }
  ];

  const handleCheckIn = async (bookingId: string) => {
    try {
      console.log("Checking in booking with ID:", bookingId);
      
      // Use bracket notation for column name with spaces
      const { data, error } = await supabase
        .from("bookings")
        .update({ ["status store"]: "completed" })
        .eq("id", bookingId)
        .select();

      console.log("Update response:", { data, error });

      if (error) {
        console.error("Supabase error checking in booking:", error);
        throw error;
      }
      
      toast({
        title: "チェックイン完了",
        description: "予約のステータスを完了に更新しました。",
      });
      
      // Update local state
      const bookingToUpdate = bookings.find(b => b.id === bookingId);
      if (!bookingToUpdate) {
        console.error("Booking not found in local state:", bookingId);
        return;
      }
      
      console.log("Current booking before update:", bookingToUpdate);
      
      const updatedBookings = bookings.map(booking => 
        booking.id === bookingId 
          ? { 
              ...booking, 
              storeStatus: "completed",
              status: getJapaneseStatus(calculateCombinedStatus(booking.therapistStatus, "completed"))
            } 
          : booking
      );
      
      setBookings(updatedBookings);
      setTodayBookings(updatedBookings.filter(booking => isToday(parseISO(booking.originalDate))));
      applyFiltersAndSorting(updatedBookings);
      
    } catch (error) {
      console.error("Error checking in booking:", error);
      toast({
        title: "エラー",
        description: "チェックインに失敗しました。",
        variant: "destructive"
      });
    }
  };

  const handleViewBookingDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowBookingDetails(true);
  };
  
  const handleCancelBooking = async (bookingId: string) => {
    try {
      console.log("Cancelling booking with ID:", bookingId);
      
      // Use bracket notation for column name with spaces
      const { data, error } = await supabase
        .from("bookings")
        .update({ ["status store"]: "cancelled" })
        .eq("id", bookingId)
        .select();

      console.log("Update response:", { data, error });

      if (error) {
        console.error("Supabase error cancelling booking:", error);
        throw error;
      }
      
      toast({
        title: "キャンセル完了",
        description: "予約をキャンセルしました。",
      });
      
      // Update local state
      const bookingToUpdate = bookings.find(b => b.id === bookingId);
      if (!bookingToUpdate) {
        console.error("Booking not found in local state:", bookingId);
        return;
      }
      
      console.log("Current booking before update:", bookingToUpdate);
      
      const updatedBookings = bookings.map(booking => 
        booking.id === bookingId 
          ? { 
              ...booking, 
              storeStatus: "cancelled",
              status: getJapaneseStatus(calculateCombinedStatus(booking.therapistStatus, "cancelled"))
            } 
          : booking
      );
      
      setBookings(updatedBookings);
      setTodayBookings(updatedBookings.filter(booking => isToday(parseISO(booking.originalDate))));
      applyFiltersAndSorting(updatedBookings);
      
    } catch (error) {
      console.error("Error cancelling booking:", error);
      toast({
        title: "エラー",
        description: "予約のキャンセルに失敗しました。",
        variant: "destructive"
      });
    }
  };

  const handleConfirmBooking = async (bookingId: string) => {
    try {
      console.log("Confirming booking with ID:", bookingId);
      
      // Use bracket notation for column name with spaces
      const { data, error } = await supabase
        .from("bookings")
        .update({ ["status store"]: "confirmed" })
        .eq("id", bookingId)
        .select();

      console.log("Update response:", { data, error });

      if (error) {
        console.error("Supabase error confirming booking:", error);
        throw error;
      }
      
      toast({
        title: "店舗側予約確定",
        description: "予約を店舗側で確定しました。セラピスト側の確認も必要です。",
      });
      
      // Update local state
      const bookingToUpdate = bookings.find(b => b.id === bookingId);
      if (!bookingToUpdate) {
        console.error("Booking not found in local state:", bookingId);
        return;
      }
      
      console.log("Current booking before update:", bookingToUpdate);
      
      const combinedStatus = calculateCombinedStatus(
        bookingToUpdate.therapistStatus, 
        "confirmed" // New store status
      );
      
      const updatedBookings = bookings.map(booking => 
        booking.id === bookingId 
          ? { 
              ...booking, 
              storeStatus: "confirmed",
              status: getJapaneseStatus(combinedStatus)
            } 
          : booking
      );
      
      setBookings(updatedBookings);
      setTodayBookings(updatedBookings.filter(booking => isToday(parseISO(booking.originalDate))));
      
      // Recalculate new bookings count
      const oneDayAgo = subDays(new Date(), 1);
      const newBookings = updatedBookings.filter(booking => 
        (booking.status === "仮予約") || 
        (booking.created_at && new Date(booking.created_at) > oneDayAgo)
      );
      setNewBookingsCount(newBookings.length);
      
      // Recalculate new today bookings count
      const newTodayBookings = newBookings.filter(booking => 
        isToday(parseISO(booking.originalDate))
      );
      setNewTodayBookingsCount(newTodayBookings.length);
      
      applyFiltersAndSorting(updatedBookings);
      
      // Send notification to therapist about store response
      try {
        const therapistId = bookingToUpdate.therapistId;
        const bookingDate = parseISO(bookingToUpdate.originalDate);
        
        // Get store name for notification
        const { data: storeData, error: storeError } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', storeId)
          .single();
          
        const storeName = storeData?.name || "店舗";
        
        // Notify therapist about store response
        await sendStoreResponseNotificationToTherapist(
          therapistId,
          storeName,
          bookingDate,
          "confirmed"
        );
      } catch (notifyError) {
        console.error("Error sending store response notification:", notifyError);
        // Continue even if notification fails
      }
      
      // Check if both therapist and store have confirmed
      // Since we're in handleConfirmBooking, the new store status is 'confirmed'
      const isFinalConfirmation = bookingToUpdate.therapistStatus === 'confirmed';
      // In confirmation flow, there's no rejection
      
      if (isFinalConfirmation) {
        try {
          // Get user and therapist details for notification
          const userId = bookingToUpdate.userId;
          const therapistName = bookingToUpdate.therapistName;
          const bookingDate = parseISO(bookingToUpdate.originalDate);
          
          // Send confirmation to client
          await sendBookingConfirmationToClient(
            userId,
            therapistName,
            bookingDate
          );
          
          toast({
            title: "予約確定の通知を送信しました",
            description: "お客様へ予約確定の通知が送信されました",
          });
        } catch (notifyError) {
          console.error("Error sending booking confirmation notification:", notifyError);
          // Continue even if notification fails
        }
      }
      
    } catch (error) {
      console.error("Error confirming booking:", error);
      toast({
        title: "エラー",
        description: "予約の確定に失敗しました。",
        variant: "destructive"
      });
    }
  };

  const getFilterOptions = () => {
    return (
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="flex-1">
          <Input
            placeholder="検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="ステータス" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべて</SelectItem>
              <SelectItem value="pending">仮予約</SelectItem>
              <SelectItem value="confirmed">確定</SelectItem>
              <SelectItem value="completed">完了</SelectItem>
              <SelectItem value="cancelled">キャンセル</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={therapistFilter} onValueChange={setTherapistFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="セラピスト" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべてのセラピスト</SelectItem>
              {therapists.map(therapist => (
                <SelectItem key={therapist.id} value={therapist.id}>
                  {therapist.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[180px] justify-start">
                <Calendar className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "yyyy/MM/dd")} - {format(dateRange.to, "yyyy/MM/dd")}
                    </>
                  ) : (
                    format(dateRange.from, "yyyy/MM/dd")
                  )
                ) : (
                  "日付で絞り込み"
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <div className="p-3">
                <DayPicker
                  mode="range"
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                  className="border-0"
                />
                <div className="mt-3 border-t border-border pt-3">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-full"
                    onClick={() => setDateRange(undefined)}
                  >
                    クリア
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          
          <Select value={sortOrder} onValueChange={(value) => setSortOrder(value as any)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="並び替え" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">最新順</SelectItem>
              <SelectItem value="oldest">古い順</SelectItem>
              <SelectItem value="price-high">料金（高い順）</SelectItem>
              <SelectItem value="price-low">料金（安い順）</SelectItem>
              <SelectItem value="status">ステータス順</SelectItem>
              <SelectItem value="therapist">セラピスト名順</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            更新
          </Button>
        </div>
      </div>
    );
  };

  // Add a helper function to calculate the combined status
  const calculateCombinedStatus = (therapistStatus: string | null, storeStatus: string | null): string => {
    // Default to pending if null
    therapistStatus = therapistStatus || "pending";
    storeStatus = storeStatus || "pending";
    
    // If either is cancelled, the booking is cancelled
    if (therapistStatus === "cancelled" || storeStatus === "cancelled") {
      return "cancelled";
    }
    
    // If both are confirmed, the booking is confirmed
    if (therapistStatus === "confirmed" && storeStatus === "confirmed") {
      return "confirmed";
    }
    
    // If either is completed and the other is confirmed or completed, the booking is completed
    if ((therapistStatus === "completed" || storeStatus === "completed") && 
        (therapistStatus === "confirmed" || therapistStatus === "completed") && 
        (storeStatus === "confirmed" || storeStatus === "completed")) {
      return "completed";
    }
    
    // Otherwise, it's still pending
    return "pending";
  };

  // Add function to get approval status text
  const getApprovalStatusText = (therapistStatus: string | null, storeStatus: string | null): string => {
    therapistStatus = therapistStatus || "pending";
    storeStatus = storeStatus || "pending";
    
    if (therapistStatus === "pending" && storeStatus === "confirmed") {
      return "セラピスト承認待ち";
    } else if (therapistStatus === "confirmed" && storeStatus === "pending") {
      return "店舗承認待ち";
    } else if (therapistStatus === "pending" && storeStatus === "pending") {
      return "双方承認待ち";
    }
    
    return "";
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">予約管理</h1>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
          <Button 
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={handleRefresh}
          >
            再試行
          </Button>
        </div>
      )}

      <Tabs defaultValue="today" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="today" className="relative">
            本日の予約
            {newTodayBookingsCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                {newTodayBookingsCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="all" className="relative">
            すべての予約
            {newBookingsCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                {newBookingsCount}
              </span>
            )}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="today">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">本日の予約</CardTitle>
              <CardDescription>
                {format(new Date(), "yyyy年MM月dd日", { locale: ja })}の予約一覧
              </CardDescription>
            </CardHeader>
            <CardContent>
              {getFilterOptions()}
              
              {loading ? (
                <div className="flex justify-center items-center py-10">
                  <Loader2 className="h-10 w-10 animate-spin text-primary mr-2" />
                  <span>予約データを読み込み中...</span>
                </div>
              ) : todayBookings.length > 0 ? (
                <DataTable 
                  columns={columns} 
                  data={filteredResults.filter(booking => isToday(parseISO(booking.originalDate)))} 
                />
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  本日の予約はありません
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">すべての予約</CardTitle>
              <CardDescription>
                過去と将来のすべての予約を表示します
              </CardDescription>
            </CardHeader>
            <CardContent>
              {getFilterOptions()}
              
              {loading ? (
                <div className="flex justify-center items-center py-10">
                  <Loader2 className="h-10 w-10 animate-spin text-primary mr-2" />
                  <span>予約データを読み込み中...</span>
                </div>
              ) : bookings.length > 0 ? (
                <DataTable 
                  columns={columns} 
                  data={filteredResults} 
                />
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  予約データがありません
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Booking Details Dialog */}
      <Dialog open={showBookingDetails} onOpenChange={setShowBookingDetails}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>予約詳細</DialogTitle>
            <DialogDescription>
              予約 #{selectedBooking?.id?.substring(0, 8)} の詳細情報
            </DialogDescription>
          </DialogHeader>
          
          {selectedBooking && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">顧客</Label>
                <div className="col-span-3">{selectedBooking.clientName}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">セラピスト</Label>
                <div className="col-span-3">{selectedBooking.therapistName}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">日付・時間</Label>
                <div className="col-span-3">{selectedBooking.date} {selectedBooking.time}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">場所</Label>
                <div className="col-span-3">{selectedBooking.location || "未指定"}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">サービス</Label>
                <div className="col-span-3">{selectedBooking.serviceName}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">料金</Label>
                <div className="col-span-3">{selectedBooking.price.toLocaleString()}円</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">ステータス</Label>
                <div className="col-span-3">
                  <Badge variant="outline" className={
                    selectedBooking.status === "確定" ? "bg-green-100 text-green-800 border-0" :
                    selectedBooking.status === "キャンセル" ? "bg-red-100 text-red-800 border-0" :
                    selectedBooking.status === "完了" ? "bg-blue-100 text-blue-800 border-0" :
                    "bg-yellow-100 text-yellow-800 border-0"
                  }>
                    {selectedBooking.status}
                  </Badge>
                  <div className="mt-2 text-sm grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-muted-foreground">セラピスト:</span>{" "}
                      <Badge variant="outline" className={
                        selectedBooking.therapistStatus === "confirmed" ? "bg-green-50 text-green-700 border-0" :
                        selectedBooking.therapistStatus === "cancelled" ? "bg-red-50 text-red-700 border-0" :
                        selectedBooking.therapistStatus === "completed" ? "bg-blue-50 text-blue-700 border-0" :
                        "bg-yellow-50 text-yellow-700 border-0"
                      }>
                        {selectedBooking.therapistStatus === "confirmed" ? "確定" : 
                         selectedBooking.therapistStatus === "cancelled" ? "キャンセル" : 
                         selectedBooking.therapistStatus === "completed" ? "完了" : "仮予約"}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-muted-foreground">店舗:</span>{" "}
                      <Badge variant="outline" className={
                        selectedBooking.storeStatus === "confirmed" ? "bg-green-50 text-green-700 border-0" :
                        selectedBooking.storeStatus === "cancelled" ? "bg-red-50 text-red-700 border-0" :
                        selectedBooking.storeStatus === "completed" ? "bg-blue-50 text-blue-700 border-0" :
                        "bg-yellow-50 text-yellow-700 border-0"
                      }>
                        {selectedBooking.storeStatus === "confirmed" ? "確定" : 
                         selectedBooking.storeStatus === "cancelled" ? "キャンセル" : 
                         selectedBooking.storeStatus === "completed" ? "完了" : "仮予約"}
                      </Badge>
                    </div>
                  </div>
                  {getApprovalStatusText(selectedBooking.therapistStatus, selectedBooking.storeStatus) && (
                    <div className="mt-1 text-xs text-muted-foreground">
                      {getApprovalStatusText(selectedBooking.therapistStatus, selectedBooking.storeStatus)}
                    </div>
                  )}
                </div>
              </div>
              {selectedBooking.notes && (
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label className="text-right">メモ</Label>
                  <div className="col-span-3 whitespace-pre-wrap">{selectedBooking.notes}</div>
                </div>
              )}
              
              <div className="flex justify-end gap-2 mt-4">
                {selectedBooking.status === "confirmed" && (
                  <Button onClick={() => {
                    handleCheckIn(selectedBooking.id);
                    setShowBookingDetails(false);
                  }}>
                    チェックイン（完了に変更）
                  </Button>
                )}
                {(selectedBooking.status === "pending" || selectedBooking.status === "confirmed") && (
                  <Button 
                    variant="destructive"
                    onClick={() => {
                      handleCancelBooking(selectedBooking.id);
                      setShowBookingDetails(false);
                    }}
                  >
                    キャンセル
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StoreBookings;
