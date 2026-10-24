<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\CenterOfExcellence;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CenterOfExcellenceController extends Controller
{
    public function index(Request $request)
    {
        $query = CenterOfExcellence::with('branch');

        if ($request->filled('search')) {
            $search = $request->search;

            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('slug', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('branch_id')) {
            $query->where('branch_id', $request->branch_id);
        }

        return response()->json(
            $query->latest()->paginate(15)
        );
    }

    public function show($id)
    {
        $center = CenterOfExcellence::with('branch')->findOrFail($id);

        return response()->json($center);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'unique:center_of_excellences,slug'],
            'description' => ['nullable', 'string'],
            'image_url' => ['nullable', 'string', 'max:2048'],
            'status' => ['required', Rule::in(['active', 'inactive'])],
            'branch_id' => ['nullable', 'integer', 'exists:branches,id'],
        ]);

        $center = CenterOfExcellence::create($validated);

        $center->load('branch');

        return response()->json($center, 201);
    }

    public function update(Request $request, $id)
    {
        $center = CenterOfExcellence::findOrFail($id);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => [
                'required',
                'string',
                'max:255',
                Rule::unique('center_of_excellences', 'slug')
                    ->ignore($center->id),
            ],
            'description' => ['nullable', 'string'],
            'image_url' => ['nullable', 'string', 'max:2048'],
            'status' => ['required', Rule::in(['active', 'inactive'])],
            'branch_id' => ['nullable', 'integer', 'exists:branches,id'],
        ]);

        $center->update($validated);

        $center->load('branch');

        return response()->json($center);
    }

    public function destroy($id)
    {
        $center = CenterOfExcellence::findOrFail($id);

        $center->delete();

        return response()->json([
            'message' => 'Center of Excellence deleted successfully.'
        ]);
    }
}
