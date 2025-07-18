import { api } from '@/lib/api';
import { ActivityItem } from './types';

export class RecentActivityService {
  constructor(private maxItems: number = 6) {}

  async fetchRecentActivity(): Promise<ActivityItem[]> {
    try {
      // Load recent data from all modules
      const [projectsRes, customersRes, invoicesRes] = await Promise.allSettled([
        api.getProjects(),
        api.getCustomers(),
        api.getTableData('invoices')
      ]);

      const activities: ActivityItem[] = [];

      // Process projects
      if (projectsRes.status === 'fulfilled' && projectsRes.value.success && projectsRes.value.data) {
        const projectActivities = this.processProjects(projectsRes.value.data);
        activities.push(...projectActivities);
      }

      // Process customers
      if (customersRes.status === 'fulfilled' && customersRes.value.success && customersRes.value.data) {
        const customerActivities = this.processCustomers(customersRes.value.data);
        activities.push(...customerActivities);
      }

      // Process invoices
      if (invoicesRes.status === 'fulfilled' && invoicesRes.value.success && invoicesRes.value.data) {
        const invoiceActivities = this.processInvoices(invoicesRes.value.data);
        activities.push(...invoiceActivities);
      }

      // Sort by timestamp (most recent first) and take top items
      return this.sortAndLimitActivities(activities);
    } catch (error) {
      console.error('Failed to load recent activity:', error);
      throw new Error('Failed to load recent activity');
    }
  }

  private processProjects(projects: Record<string, unknown>[]): ActivityItem[] {
    return projects.slice(0, 3).map((project) => ({
      id: `project-${project.system_id}`,
      type: 'project' as const,
      title: (project.name as string) || 'Unnamed Project',
      description: `Project ${project.system_id} created`,
      timestamp: project.created_at as string,
      status: project.status as string
    }));
  }

  private processCustomers(customers: Record<string, unknown>[]): ActivityItem[] {
    return customers.slice(0, 3).map((customer) => ({
      id: `customer-${customer.system_id}`,
      type: 'customer' as const,
      title: (customer.name as string) || 'Unnamed Customer',
      description: `Customer ${customer.system_id} added`,
      timestamp: customer.created_at as string,
      status: customer.is_active ? 'active' : 'inactive'
    }));
  }

  private processInvoices(invoices: Record<string, unknown>[]): ActivityItem[] {
    return invoices.slice(0, 3).map((invoice) => ({
      id: `invoice-${invoice.system_id}`,
      type: 'invoice' as const,
      title: `Invoice ${invoice.system_id}`,
      description: `${(invoice.currency as string) || 'USD'} ${parseFloat((invoice.amount as string) || '0').toFixed(2)} invoice created`,
      timestamp: invoice.created_at as string,
      status: invoice.status as string
    }));
  }

  private sortAndLimitActivities(activities: ActivityItem[]): ActivityItem[] {
    return activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, this.maxItems);
  }

  static formatTimestamp(timestamp: string): string {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  static validateActivity(activity: ActivityItem): boolean {
    return !!(
      activity.id &&
      activity.type &&
      activity.title &&
      activity.timestamp
    );
  }
}
