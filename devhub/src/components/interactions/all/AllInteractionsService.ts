import { CustomerInteraction } from './types';

export class AllInteractionsService {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  /**
   * Fetches all interactions across all customers
   */
  async fetchAllInteractions(): Promise<CustomerInteraction[]> {
    try {
      // Get all customers first
      const customersResponse = await fetch('http://localhost:8005/api/v1/database/table/customers', {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!customersResponse.ok) {
        throw new Error(`Failed to fetch customers: ${customersResponse.status}`);
      }

      const customersData = await customersResponse.json();
      
      if (!customersData.success || !customersData.data) {
        throw new Error('No customer data available');
      }

      // Fetch interactions for all customers
      const allInteractions: CustomerInteraction[] = [];
      
      // Use Promise.allSettled for better error handling
      const interactionPromises = customersData.data.map(async (customer: Record<string, unknown>) => {
        try {
          const interactionsResponse = await fetch(
            `http://localhost:8005/api/crm/customers/${customer.system_id}/interactions`, 
            {
              headers: {
                'Authorization': `Bearer ${this.token}`,
                'Content-Type': 'application/json',
              },
            }
          );

          if (interactionsResponse.ok) {
            const interactionsData = await interactionsResponse.json();
            if (interactionsData.success && interactionsData.data) {
              // Add customer info to each interaction
              return interactionsData.data.map((interaction: Record<string, unknown>) => ({
                ...interaction,
                customer: {
                  system_id: customer.system_id,
                  name: customer.name,
                  email: customer.email
                }
              }));
            }
          }
          return [];
        } catch (err) {
          console.warn(`Failed to fetch interactions for customer ${customer.name}:`, err);
          return [];
        }
      });

      const results = await Promise.allSettled(interactionPromises);
      
      // Combine all successful results
      results.forEach(result => {
        if (result.status === 'fulfilled' && result.value) {
          allInteractions.push(...result.value);
        }
      });

      // Sort by most recent first
      return this.sortInteractionsByDate(allInteractions);
    } catch (err) {
      console.error('Error fetching all interactions:', err);
      throw new Error(err instanceof Error ? err.message : 'Failed to load interactions');
    }
  }

  /**
   * Sorts interactions by creation date (most recent first)
   */
  private sortInteractionsByDate(interactions: CustomerInteraction[]): CustomerInteraction[] {
    return interactions.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  /**
   * Formats a date string for display
   */
  static formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  /**
   * Gets the total number of interactions grouped by status
   */
  static getInteractionStats(interactions: CustomerInteraction[]): Record<string, number> {
    return interactions.reduce((stats, interaction) => {
      stats[interaction.status] = (stats[interaction.status] || 0) + 1;
      return stats;
    }, {} as Record<string, number>);
  }

  /**
   * Filters interactions by various criteria
   */
  static filterInteractions(
    interactions: CustomerInteraction[], 
    filters: {
      type?: string;
      priority?: string;
      status?: string;
      customerId?: string;
    }
  ): CustomerInteraction[] {
    return interactions.filter(interaction => {
      if (filters.type && interaction.interaction_type !== filters.type) return false;
      if (filters.priority && interaction.priority !== filters.priority) return false;
      if (filters.status && interaction.status !== filters.status) return false;
      if (filters.customerId && interaction.customer.system_id !== filters.customerId) return false;
      return true;
    });
  }
}
