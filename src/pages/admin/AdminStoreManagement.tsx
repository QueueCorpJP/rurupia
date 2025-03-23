
import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { DataTable } from '@/components/admin/DataTable';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const sortOptions = [
  { label: '全て表示', value: 'all' },
  { label: '新しい順', value: 'newest' },
  { label: '古い順', value: 'oldest' },
  { label: '価格の高い順', value: 'price-high' },
  { label: '価格の低い順', value: 'price-low' },
];

const AdminStoreManagement = () => {
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newService, setNewService] = useState({
    name: '',
    description: '',
    price: '',
    duration: ''
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedServices = data.map(service => ({
        id: service.id,
        name: service.name,
        description: service.description || '',
        price: `¥${service.price.toLocaleString()}`,
        duration: `${service.duration}分`,
        rawPrice: service.price,
        rawDuration: service.duration
      }));

      setServices(formattedServices);
      setFilteredServices(formattedServices);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast.error('サービス情報の取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (term) => {
    if (!term.trim()) {
      setFilteredServices(services);
      return;
    }
    
    const filtered = services.filter(
      service => 
        service.name.toLowerCase().includes(term.toLowerCase()) || 
        service.description.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredServices(filtered);
  };

  const handleSortChange = (value) => {
    let sorted = [...services];
    
    switch(value) {
      case 'all':
        setFilteredServices(services);
        break;
      case 'newest':
        // Already sorted by default
        setFilteredServices(sorted);
        break;
      case 'oldest':
        sorted.reverse();
        setFilteredServices(sorted);
        break;
      case 'price-high':
        sorted.sort((a, b) => b.rawPrice - a.rawPrice);
        setFilteredServices(sorted);
        break;
      case 'price-low':
        sorted.sort((a, b) => a.rawPrice - b.rawPrice);
        setFilteredServices(sorted);
        break;
      default:
        setFilteredServices(services);
    }
  };

  const handleEdit = (service) => {
    toast.info(`編集: ${service.name}`);
    // Implement edit functionality
  };

  const handleDelete = async (service) => {
    if (window.confirm(`「${service.name}」を削除してもよろしいですか？`)) {
      try {
        const { error } = await supabase
          .from('services')
          .delete()
          .eq('id', service.id);

        if (error) throw error;

        setServices(prevServices => prevServices.filter(s => s.id !== service.id));
        setFilteredServices(prevFiltered => prevFiltered.filter(s => s.id !== service.id));
        toast.success('サービスを削除しました');
      } catch (error) {
        console.error('Error deleting service:', error);
        toast.error('サービスの削除に失敗しました');
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewService(prev => ({ ...prev, [name]: value }));
  };

  const handleAddService = async () => {
    try {
      // Validate inputs
      if (!newService.name || !newService.price || !newService.duration) {
        toast.error('名前、価格、施術時間は必須項目です');
        return;
      }

      const price = parseInt(newService.price);
      const duration = parseInt(newService.duration);

      if (isNaN(price) || isNaN(duration)) {
        toast.error('価格と施術時間は数値で入力してください');
        return;
      }

      const { data, error } = await supabase
        .from('services')
        .insert({
          name: newService.name,
          description: newService.description,
          price: price,
          duration: duration
        })
        .select();

      if (error) throw error;

      // Reset form and close dialog
      setNewService({
        name: '',
        description: '',
        price: '',
        duration: ''
      });
      setIsDialogOpen(false);

      // Add new service to the list
      if (data && data.length > 0) {
        const newServiceData = {
          id: data[0].id,
          name: data[0].name,
          description: data[0].description || '',
          price: `¥${data[0].price.toLocaleString()}`,
          duration: `${data[0].duration}分`,
          rawPrice: data[0].price,
          rawDuration: data[0].duration
        };

        setServices(prev => [newServiceData, ...prev]);
        setFilteredServices(prev => [newServiceData, ...prev]);
      }

      toast.success('サービスを追加しました');
    } catch (error) {
      console.error('Error adding service:', error);
      toast.error('サービスの追加に失敗しました');
    }
  };

  const columns = [
    { key: 'name', label: 'サービス名' },
    { key: 'description', label: '詳細' },
    { key: 'price', label: '価格' },
    { key: 'duration', label: '施術時間' },
  ];

  const actionMenuItems = [
    { label: '編集する', onClick: handleEdit },
    { label: '削除する', onClick: handleDelete },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">コース管理</h1>
          <p className="text-muted-foreground mt-2">施術コースの登録と管理</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          新規登録
        </Button>
      </div>
      
      <DataTable 
        columns={columns}
        data={filteredServices}
        searchPlaceholder="サービス名や詳細で検索"
        sortOptions={sortOptions}
        onSearchChange={handleSearch}
        onSortChange={handleSortChange}
        actionMenuItems={actionMenuItems}
        isLoading={isLoading}
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>新規コース登録</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">サービス名</Label>
              <Input
                id="name"
                name="name"
                value={newService.name}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">詳細</Label>
              <Textarea
                id="description"
                name="description"
                value={newService.description}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="price">価格 (円)</Label>
              <Input
                id="price"
                name="price"
                type="number"
                value={newService.price}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="duration">施術時間 (分)</Label>
              <Input
                id="duration"
                name="duration"
                type="number"
                value={newService.duration}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>キャンセル</Button>
            <Button onClick={handleAddService}>登録する</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminStoreManagement;
