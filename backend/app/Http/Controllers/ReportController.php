<?php

namespace App\Http\Controllers;

use App\Models\RenewalApplication;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function renewalSummary(Request $request)
    {
        $user = $request->user();

        $apps = RenewalApplication::query()
            ->where('user_id', (string) $user->getKey())
            ->orderByDesc('created_at')
            ->limit(200)
            ->get();

        $submitted = $apps->where('status', 'submitted')->values();
        $drafts = $apps->where('status', 'draft')->values();

        $lines = [];
        $lines[] = ['renewal_type_code', 'status', 'submitted_at'];

        foreach ($apps as $a) {
            $lines[] = [
                (string) ($a->renewal_type_code ?? ''),
                (string) ($a->status ?? ''),
                (string) ($a->submitted_at ?? ''),
            ];
        }

        $csv = $this->toCsv($lines);

        return response($csv, 200, [
            'Content-Type' => 'text/csv; charset=utf-8',
            'Content-Disposition' => 'attachment; filename="renewal-summary.csv"',
            'X-Total' => (string) $apps->count(),
            'X-Submitted' => (string) $submitted->count(),
            'X-Drafts' => (string) $drafts->count(),
        ]);
    }

    private function toCsv(array $rows): string
    {
        $fh = fopen('php://temp', 'r+');
        foreach ($rows as $row) {
            fputcsv($fh, $row);
        }
        rewind($fh);
        return stream_get_contents($fh) ?: '';
    }
}

