<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EducationalResource extends Model
{
    use HasFactory;

    protected $table = 'educational_resources';

    protected $fillable = [
        'title',
        'description',
        'type',
        'url',
        'tags',
    ];

    protected $casts = [
        'tags' => 'array',
    ];
}
