'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { LeadStatusBadge } from '@/components/leads/LeadStatusBadge';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import {
  Search,
  Mail,
  Trash2,
  Globe,
  Phone,
  Building2,
  ExternalLink,
  CheckSquare,
  Square,
  Sparkles,
} from 'lucide-react';

export function LeadTable({ initialLeads = [] }: { initialLeads: any[] }) {
  const [leads, setLeads] = useState<any[]>(initialLeads);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();

  const filteredLeads = leads.filter((lead) => {
    const term = searchTerm.toLowerCase();
    return (
      lead.name?.toLowerCase().includes(term) ||
      lead.email?.toLowerCase().includes(term) ||
      lead.company?.toLowerCase().includes(term) ||
      lead.city?.toLowerCase().includes(term) ||
      lead.status?.toLowerCase().includes(term)
    );
  });

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredLeads.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredLeads.map((l) => l.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleDeleteLead = async (id: string) => {
    if (!confirm('Are you sure you want to delete this lead?')) return;

    try {
      const res = await fetch('/api/leads/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'DELETE', leadIds: [id] }),
      });

      if (!res.ok) throw new Error('Failed to delete lead');

      setLeads((prev) => prev.filter((l) => l.id !== id));
      setSelectedIds((prev) => prev.filter((item) => item !== id));

      toast({
        title: 'Lead Deleted',
        description: 'Selected lead removed from your database.',
      });
    } catch (err: any) {
      toast({
        title: 'Delete Failed',
        description: err.message,
        variant: 'destructive',
      });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} selected leads?`)) return;

    setDeleting(true);
    try {
      const res = await fetch('/api/leads/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'DELETE', leadIds: selectedIds }),
      });

      if (!res.ok) throw new Error('Failed to bulk delete leads');

      setLeads((prev) => prev.filter((l) => !selectedIds.includes(l.id)));
      setSelectedIds([]);

      toast({
        title: 'Bulk Delete Complete',
        description: 'Selected leads successfully deleted.',
      });
    } catch (err: any) {
      toast({
        title: 'Bulk Delete Error',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* SEARCH AND CONTROLS BAR */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search leads by name, email, company..."
            className="pl-9 bg-slate-950 border-slate-800 text-xs text-slate-100"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {selectedIds.length > 0 && (
            <>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
                disabled={deleting}
                className="text-xs h-9 px-3"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Delete ({selectedIds.length})
              </Button>

              <Button size="sm" className="bg-purple-600 hover:bg-purple-500 text-white text-xs h-9 px-3" asChild>
                <Link href="/compose">
                  <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Campaign ({selectedIds.length})
                </Link>
              </Button>
            </>
          )}

          <Badge variant="outline" className="border-slate-800 text-slate-400 text-xs px-3 py-1.5 font-mono">
            {filteredLeads.length} Leads
          </Badge>
        </div>
      </div>

      {/* LEADS TABLE */}
      <Card className="p-0 bg-slate-900/60 border-slate-800 overflow-hidden">
        {filteredLeads.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-500 space-y-2">
            <div>No leads found matching your criteria.</div>
            <div>Scrape new B2B leads from the Lead Scraper engine.</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                <tr>
                  <th className="p-3.5 w-10">
                    <button onClick={toggleSelectAll} className="flex items-center">
                      {selectedIds.length === filteredLeads.length && filteredLeads.length > 0 ? (
                        <CheckSquare className="w-4 h-4 text-blue-400" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-600" />
                      )}
                    </button>
                  </th>
                  <th className="p-3.5">Lead Prospect</th>
                  <th className="p-3.5">Company & Website</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Source</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredLeads.map((lead) => {
                  const isSelected = selectedIds.includes(lead.id);
                  return (
                    <tr
                      key={lead.id}
                      className={`hover:bg-slate-900/40 transition ${
                        isSelected ? 'bg-blue-600/5' : ''
                      }`}
                    >
                      <td className="p-3.5">
                        <button onClick={() => toggleSelectOne(lead.id)} className="flex items-center">
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-blue-400" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-600" />
                          )}
                        </button>
                      </td>

                      <td className="p-3.5">
                        <div className="font-semibold text-slate-100 text-sm">{lead.name}</div>
                        <div className="text-[11px] text-blue-400 flex items-center gap-1 mt-0.5 font-mono">
                          <Mail className="w-3 h-3 text-slate-500" /> {lead.email}
                        </div>
                        {lead.phone && (
                          <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3 text-slate-600" /> {lead.phone}
                          </div>
                        )}
                      </td>

                      <td className="p-3.5">
                        <div className="text-slate-200 font-medium flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-slate-500" />
                          {lead.company || 'N/A'}
                        </div>
                        {lead.website && (
                          <a
                            href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] text-slate-400 hover:text-blue-400 flex items-center gap-1 mt-0.5 truncate max-w-[200px]"
                          >
                            <Globe className="w-3 h-3 text-slate-600" /> {lead.website}
                          </a>
                        )}
                      </td>

                      <td className="p-3.5">
                        <LeadStatusBadge status={lead.status} />
                      </td>

                      <td className="p-3.5">
                        <Badge variant="outline" className="border-slate-800 text-slate-400 text-[10px]">
                          {lead.source || 'Scraper'}
                        </Badge>
                      </td>

                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-slate-400 hover:text-blue-400"
                            asChild
                          >
                            <Link href="/compose">
                              <Mail className="w-4 h-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteLead(lead.id)}
                            className="h-8 w-8 p-0 text-slate-500 hover:text-rose-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}